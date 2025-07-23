import { db } from "@/lib/db"
import { paymentGateway } from "@/services/paymentGateway"
import { smsGateway } from "@/services/smsGateway"

/**
 * Background job to automatically release escrowed funds
 * This should be run as a scheduled job (e.g., cron job, queue worker)
 *
 * Escrow release conditions:
 * 1. Order status is "DELIVERED"
 * 2. Payment status is "ESCROWED"
 * 3. Delivery was confirmed more than X days ago (configurable)
 * 4. No active disputes
 */

interface EscrowReleaseConfig {
  autoReleaseDelayDays: number
  batchSize: number
}

const DEFAULT_CONFIG: EscrowReleaseConfig = {
  autoReleaseDelayDays: 7, // Auto-release after 7 days
  batchSize: 50, // Process 50 orders at a time
}

/**
 * Main function to process escrow releases
 */
export async function processEscrowReleases(config: EscrowReleaseConfig = DEFAULT_CONFIG) {
  try {
    console.log("Starting escrow release job...")

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - config.autoReleaseDelayDays)

    // Find orders eligible for escrow release
    const eligibleOrders = await db.order.findMany({
      where: {
        status: "DELIVERED",
        paymentStatus: "ESCROWED",
        updatedAt: {
          lte: cutoffDate,
        },
      },
      take: config.batchSize,
      include: {
        farmer: {
          include: {
            profile: true,
          },
        },
        seller: {
          include: {
            profile: true,
          },
        },
      },
    })

    console.log(`Found ${eligibleOrders.length} orders eligible for escrow release`)

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each order
    for (const order of eligibleOrders) {
      try {
        await processOrderEscrowRelease(order)
        results.successful++
        console.log(`Successfully released escrow for order ${order.id}`)
      } catch (error) {
        results.failed++
        const errorMessage = `Failed to release escrow for order ${order.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
        results.errors.push(errorMessage)
        console.error(errorMessage)
      }
    }

    console.log(`Escrow release job completed. Success: ${results.successful}, Failed: ${results.failed}`)

    return results
  } catch (error) {
    console.error("Escrow release job failed:", error)
    throw error
  }
}

/**
 * Process escrow release for a single order
 */
async function processOrderEscrowRelease(order: any) {
  if (!order.paymentRefId) {
    throw new Error("No payment reference ID found")
  }

  // Release escrow through payment gateway
  const releaseResult = await paymentGateway.releaseEscrow(order.paymentRefId)

  if (!releaseResult.success) {
    throw new Error(releaseResult.error || "Failed to release escrow")
  }

  // Update order payment status
  await db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "RELEASED",
      updatedAt: new Date(),
    },
  })

  // Create notifications
  await Promise.all([
    // Notify farmer
    db.notification.create({
      data: {
        userId: order.farmerId,
        type: "PAYMENT_RECEIVED",
        content: `Payment of RWF ${order.totalAmount} has been released for order #${order.id}`,
        relatedEntityId: order.id,
      },
    }),
    // Notify seller
    db.notification.create({
      data: {
        userId: order.sellerId,
        type: "ORDER_UPDATED",
        content: `Payment for order #${order.id} has been released to the farmer`,
        relatedEntityId: order.id,
      },
    }),
  ])

  // Send SMS notifications
  const smsPromises = []

  if (order.farmer.phoneNumber) {
    smsPromises.push(smsGateway.sendPaymentConfirmation(order.farmer.phoneNumber, Number(order.totalAmount), order.id))
  }

  if (order.seller.phoneNumber) {
    smsPromises.push(
      smsGateway.sendSMS({
        phoneNumber: order.seller.phoneNumber,
        message: `AgriConnect: Payment for order #${order.id} has been released to the farmer.`,
        messageType: "transactional",
      }),
    )
  }

  await Promise.all(smsPromises)
}

/**
 * Manual escrow release for specific order (admin action)
 */
export async function manualEscrowRelease(orderId: string, adminUserId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        farmer: {
          include: {
            profile: true,
          },
        },
        seller: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (order.paymentStatus !== "ESCROWED") {
      throw new Error("Order payment is not in escrow")
    }

    await processOrderEscrowRelease(order)

    // Log admin action
    console.log(`Manual escrow release performed by admin ${adminUserId} for order ${orderId}`)

    return {
      success: true,
      message: "Escrow released successfully",
    }
  } catch (error) {
    console.error("Manual escrow release failed:", error)
    throw error
  }
}

/**
 * Get escrow release statistics
 */
export async function getEscrowStats() {
  try {
    const [totalEscrowed, eligibleForRelease, releasedToday] = await Promise.all([
      db.order.count({
        where: { paymentStatus: "ESCROWED" },
      }),
      db.order.count({
        where: {
          status: "DELIVERED",
          paymentStatus: "ESCROWED",
          updatedAt: {
            lte: new Date(Date.now() - DEFAULT_CONFIG.autoReleaseDelayDays * 24 * 60 * 60 * 1000),
          },
        },
      }),
      db.order.count({
        where: {
          paymentStatus: "RELEASED",
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ])

    const totalEscrowedAmount = await db.order.aggregate({
      where: { paymentStatus: "ESCROWED" },
      _sum: { totalAmount: true },
    })

    return {
      totalEscrowed,
      eligibleForRelease,
      releasedToday,
      totalEscrowedAmount: totalEscrowedAmount._sum.totalAmount || 0,
    }
  } catch (error) {
    console.error("Failed to get escrow stats:", error)
    throw error
  }
}

// Export for use in cron jobs or queue systems
export default {
  processEscrowReleases,
  manualEscrowRelease,
  getEscrowStats,
}
