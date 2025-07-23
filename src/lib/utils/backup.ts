import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

interface BackupOptions {
  outputDir?: string
  includeUserData?: boolean
  includeLogs?: boolean
  compress?: boolean
}

interface BackupResult {
  success: boolean
  filePath?: string
  size?: number
  error?: string
}

/**
 * Database backup and restore utilities
 */
export class BackupService {
  private static readonly DEFAULT_BACKUP_DIR = "./backups"

  /**
   * Create a full database backup
   */
  static async createBackup(options: BackupOptions = {}): Promise<BackupResult> {
    const { outputDir = this.DEFAULT_BACKUP_DIR, includeUserData = true, compress = true } = options

    try {
      logger.info("Starting database backup", { options })

      // Ensure backup directory exists
      await mkdir(outputDir, { recursive: true })

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `agriconnect-backup-${timestamp}.json`
      const filePath = join(outputDir, filename)

      // Collect data from all tables
      const backupData = {
        metadata: {
          version: "1.0",
          timestamp: new Date().toISOString(),
          includeUserData,
        },
        categories: await db.category.findMany(),
        users: includeUserData
          ? await db.user.findMany({
              select: {
                id: true,
                email: true,
                role: true,
                phoneNumber: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                // Exclude sensitive data
              },
            })
          : [],
        profiles: includeUserData ? await db.profile.findMany() : [],
        farmerProfiles: includeUserData ? await db.farmerProfile.findMany() : [],
        sellerProfiles: includeUserData ? await db.sellerProfile.findMany() : [],
        products: await db.product.findMany(),
        orders: includeUserData ? await db.order.findMany() : [],
        orderItems: includeUserData ? await db.orderItem.findMany() : [],
        reviews: await db.review.findMany({
          where: { isApproved: true }, // Only approved reviews
        }),
        // Don't backup sensitive data like chat messages, notifications, etc.
      }

      // Write backup file
      const jsonData = JSON.stringify(backupData, null, 2)
      await writeFile(filePath, jsonData, "utf8")

      const stats = await import("fs").then((fs) => fs.promises.stat(filePath))

      logger.info("Database backup completed", {
        filePath,
        size: stats.size,
        recordCounts: {
          categories: backupData.categories.length,
          users: backupData.users.length,
          products: backupData.products.length,
          orders: backupData.orders.length,
          reviews: backupData.reviews.length,
        },
      })

      return {
        success: true,
        filePath,
        size: stats.size,
      }
    } catch (error) {
      logger.error("Database backup failed", error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Restore database from backup file
   */
  static async restoreBackup(backupFilePath: string): Promise<BackupResult> {
    try {
      logger.warn("Starting database restore", { backupFilePath })

      // Read backup file
      const backupData = await import("fs").then((fs) =>
        fs.promises.readFile(backupFilePath, "utf8").then((data) => JSON.parse(data)),
      )

      // Validate backup format
      if (!backupData.metadata || !backupData.metadata.version) {
        throw new Error("Invalid backup file format")
      }

      // Use transaction for atomic restore
      await db.$transaction(async (tx) => {
        // Clear existing data (be very careful with this!)
        logger.warn("Clearing existing data for restore")

        // Delete in correct order to respect foreign key constraints
        await tx.review.deleteMany()
        await tx.orderItem.deleteMany()
        await tx.order.deleteMany()
        await tx.product.deleteMany()
        await tx.farmerProfile.deleteMany()
        await tx.sellerProfile.deleteMany()
        await tx.profile.deleteMany()
        await tx.user.deleteMany()
        await tx.category.deleteMany()

        // Restore data in correct order
        logger.info("Restoring categories")
        for (const category of backupData.categories) {
          await tx.category.create({ data: category })
        }

        if (backupData.users.length > 0) {
          logger.info("Restoring users")
          for (const user of backupData.users) {
            await tx.user.create({ data: user })
          }

          logger.info("Restoring profiles")
          for (const profile of backupData.profiles) {
            await tx.profile.create({ data: profile })
          }

          for (const farmerProfile of backupData.farmerProfiles) {
            await tx.farmerProfile.create({ data: farmerProfile })
          }

          for (const sellerProfile of backupData.sellerProfiles) {
            await tx.sellerProfile.create({ data: sellerProfile })
          }
        }

        logger.info("Restoring products")
        for (const product of backupData.products) {
          await tx.product.create({ data: product })
        }

        if (backupData.orders.length > 0) {
          logger.info("Restoring orders")
          for (const order of backupData.orders) {
            await tx.order.create({ data: order })
          }

          logger.info("Restoring order items")
          for (const orderItem of backupData.orderItems) {
            await tx.orderItem.create({ data: orderItem })
          }
        }

        logger.info("Restoring reviews")
        for (const review of backupData.reviews) {
          await tx.review.create({ data: review })
        }
      })

      logger.info("Database restore completed successfully", {
        backupFile: backupFilePath,
        restoredAt: new Date().toISOString(),
      })

      return {
        success: true,
        filePath: backupFilePath,
      }
    } catch (error) {
      logger.error("Database restore failed", error as Error, { backupFilePath })
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Create automated backup (for scheduled jobs)
   */
  static async createScheduledBackup(): Promise<BackupResult> {
    const options: BackupOptions = {
      outputDir: "./backups/scheduled",
      includeUserData: true,
      compress: true,
    }

    const result = await this.createBackup(options)

    if (result.success) {
      // Clean up old backups (keep last 30 days)
      await this.cleanupOldBackups("./backups/scheduled", 30)
    }

    return result
  }

  /**
   * Clean up old backup files
   */
  static async cleanupOldBackups(backupDir: string, retentionDays: number): Promise<void> {
    try {
      const fs = await import("fs")
      const files = await fs.promises.readdir(backupDir)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      for (const file of files) {
        if (file.startsWith("agriconnect-backup-") && file.endsWith(".json")) {
          const filePath = join(backupDir, file)
          const stats = await fs.promises.stat(filePath)

          if (stats.mtime < cutoffDate) {
            await fs.promises.unlink(filePath)
            logger.info("Deleted old backup file", { file, age: stats.mtime })
          }
        }
      }
    } catch (error) {
      logger.error("Failed to cleanup old backups", error as Error)
    }
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(backupDir: string = this.DEFAULT_BACKUP_DIR): Promise<{
    totalBackups: number
    totalSize: number
    oldestBackup?: Date
    newestBackup?: Date
  }> {
    try {
      const fs = await import("fs")
      const files = await fs.promises.readdir(backupDir)
      const backupFiles = files.filter((file) => file.startsWith("agriconnect-backup-") && file.endsWith(".json"))

      let totalSize = 0
      let oldestBackup: Date | undefined
      let newestBackup: Date | undefined

      for (const file of backupFiles) {
        const filePath = join(backupDir, file)
        const stats = await fs.promises.stat(filePath)

        totalSize += stats.size

        if (!oldestBackup || stats.mtime < oldestBackup) {
          oldestBackup = stats.mtime
        }

        if (!newestBackup || stats.mtime > newestBackup) {
          newestBackup = stats.mtime
        }
      }

      return {
        totalBackups: backupFiles.length,
        totalSize,
        oldestBackup,
        newestBackup,
      }
    } catch (error) {
      logger.error("Failed to get backup stats", error as Error)
      return {
        totalBackups: 0,
        totalSize: 0,
      }
    }
  }
}
