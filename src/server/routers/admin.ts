import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, adminProcedure } from "@/lib/trpc/server"
import { paginationSchema, sortSchema } from "@/lib/utils/validation"

/**
 * Administrative actions router (admin only)
 */
export const adminRouter = createTRPCRouter({
  /**
   * Get all users with filtering and pagination
   */
  getUsers: adminProcedure
    .input(
      z.object({
        role: z.enum(["FARMER", "SELLER", "ADMIN"]).optional(),
        isVerified: z.boolean().optional(),
        search: z.string().optional(),
        ...paginationSchema.shape,
        ...sortSchema.shape,
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { role, isVerified, search, page, limit, sortBy, sortOrder } = input

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (role) where.role = role
        if (isVerified !== undefined) where.isVerified = isVerified

        if (search) {
          where.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: search, mode: "insensitive" } },
            {
              profile: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          ]
        }

        // Build orderBy clause
        let orderBy: any = { createdAt: "desc" }
        if (sortBy) {
          orderBy = { [sortBy]: sortOrder }
        }

        const [users, total] = await Promise.all([
          ctx.db.user.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            select: {
              id: true,
              email: true,
              role: true,
              phoneNumber: true,
              isVerified: true,
              createdAt: true,
              updatedAt: true,
              profile: {
                select: {
                  name: true,
                  profilePictureUrl: true,
                  location: true,
                },
              },
              _count: {
                select: {
                  ordersAsSeller: true,
                  ordersAsFarmer: true,
                },
              },
            },
          }),
          ctx.db.user.count({ where }),
        ])

        return {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch users",
        })
      }
    }),

  /**
   * Get user statistics
   */
  getUserStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const [totalUsers, verifiedUsers, roleStats, recentUsers] = await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { isVerified: true } }),
        ctx.db.user.groupBy({
          by: ["role"],
          _count: { role: true },
        }),
        ctx.db.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ])

      return {
        totalUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        recentUsers,
        roleDistribution: roleStats.reduce(
          (acc, stat) => {
            acc[stat.role] = stat._count.role
            return acc
          },
          {} as Record<string, number>,
        ),
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user statistics",
      })
    }
  }),

  /**
   * Get platform statistics
   */
  getPlatformStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const [totalProducts, activeProducts, totalOrders, completedOrders, totalRevenue, pendingReviews] =
        await Promise.all([
          ctx.db.product.count(),
          ctx.db.product.count({ where: { status: "ACTIVE" } }),
          ctx.db.order.count(),
          ctx.db.order.count({ where: { status: "DELIVERED" } }),
          ctx.db.order.aggregate({
            where: { paymentStatus: "PAID" },
            _sum: { totalAmount: true },
          }),
          ctx.db.review.count({ where: { isApproved: false } }),
        ])

      return {
        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: totalProducts - activeProducts,
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: totalOrders - completedOrders,
        },
        revenue: {
          total: totalRevenue._sum.totalAmount || 0,
        },
        reviews: {
          pendingModeration: pendingReviews,
        },
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch platform statistics",
      })
    }
  }),

  /**
   * Update user verification status
   */
  updateUserVerification: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid("Invalid user ID"),
        isVerified: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, isVerified } = input

        const user = await ctx.db.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          })
        }

        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: { isVerified },
        })

        // Create notification for user
        await ctx.db.notification.create({
          data: {
            userId,
            type: "SYSTEM_ANNOUNCEMENT",
            content: isVerified ? "Your account has been verified" : "Your account verification has been revoked",
          },
        })

        return {
          success: true,
          message: `User ${isVerified ? "verified" : "unverified"} successfully`,
          user: updatedUser,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user verification",
        })
      }
    }),

  /**
   * Get pending reviews for moderation
   */
  getPendingReviews: adminProcedure.input(paginationSchema).query(async ({ ctx, input }) => {
    try {
      const { page, limit } = input
      const skip = (page - 1) * limit

      const [reviews, total] = await Promise.all([
        ctx.db.review.findMany({
          where: { isApproved: false },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            reviewer: {
              select: {
                id: true,
                profile: {
                  select: {
                    name: true,
                    profilePictureUrl: true,
                  },
                },
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                imageUrls: true,
              },
            },
          },
        }),
        ctx.db.review.count({ where: { isApproved: false } }),
      ])

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pending reviews",
      })
    }
  }),

  /**
   * Create system announcement
   */
  createAnnouncement: adminProcedure
    .input(
      z.object({
        content: z.string().min(10, "Announcement content must be at least 10 characters"),
        targetRole: z.enum(["FARMER", "SELLER", "ALL"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { content, targetRole } = input

        // Get target users
        const where: any = {}
        if (targetRole && targetRole !== "ALL") {
          where.role = targetRole
        }

        const targetUsers = await ctx.db.user.findMany({
          where,
          select: { id: true },
        })

        // Create notifications for all target users
        const notifications = targetUsers.map((user) => ({
          userId: user.id,
          type: "SYSTEM_ANNOUNCEMENT" as const,
          content,
        }))

        await ctx.db.notification.createMany({
          data: notifications,
        })

        return {
          success: true,
          message: `Announcement sent to ${notifications.length} users`,
          recipientCount: notifications.length,
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create announcement",
        })
      }
    }),

  /**
   * Get system logs (placeholder for future implementation)
   */
  getSystemLogs: adminProcedure
    .input(
      z.object({
        level: z.enum(["ERROR", "WARN", "INFO", "DEBUG"]).optional(),
        ...paginationSchema.shape,
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Implement system logging functionality
        // This would typically involve a separate logging system

        return {
          logs: [],
          pagination: {
            page: input.page,
            limit: input.limit,
            total: 0,
            pages: 0,
          },
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch system logs",
        })
      }
    }),
})
