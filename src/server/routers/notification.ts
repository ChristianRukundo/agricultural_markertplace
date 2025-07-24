import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server"
import {
  getNotificationsSchema,
  markNotificationAsReadSchema,
  markAllNotificationsAsReadSchema,
} from "@/validation/notification"

/**
 * Notification management router
 */
export const notificationRouter = createTRPCRouter({
  /**
   * Get user's notifications
   */
  getNotifications: protectedProcedure.input(getNotificationsSchema).query(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id as string;
      const { isRead, type, page, limit } = input

      const skip = (page - 1) * limit

      // Build where clause
      const where: any = {
        userId,
      }

      if (isRead !== undefined) where.isRead = isRead
      if (type) where.type = type

      const [notifications, total, unreadCount] = await Promise.all([
        ctx.db.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { timestamp: "desc" },
        }),
        ctx.db.notification.count({ where }),
        ctx.db.notification.count({
          where: {
            userId,
            isRead: false,
          },
        }),
      ])

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch notifications",
      })
    }
  }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure.input(markNotificationAsReadSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const { id } = input

      const notification = await ctx.db.notification.findUnique({
        where: { id },
      })

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        })
      }

      // Verify ownership
      if (notification.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only mark your own notifications as read",
        })
      }

      const updatedNotification = await ctx.db.notification.update({
        where: { id },
        data: { isRead: true },
      })

      return {
        success: true,
        message: "Notification marked as read",
        notification: updatedNotification,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to mark notification as read",
      })
    }
  }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.input(markAllNotificationsAsReadSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const { type } = input

      // Build where clause
      const where: any = {
        userId,
        isRead: false,
      }

      if (type) where.type = type

      const result = await ctx.db.notification.updateMany({
        where,
        data: { isRead: true },
      })

      return {
        success: true,
        message: `${result.count} notifications marked as read`,
        count: result.count,
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to mark notifications as read",
      })
    }
  }),

  /**
   * Delete notification
   */
  delete: protectedProcedure.input(markNotificationAsReadSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const { id } = input

      const notification = await ctx.db.notification.findUnique({
        where: { id },
      })

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        })
      }

      // Verify ownership
      if (notification.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own notifications",
        })
      }

      await ctx.db.notification.delete({
        where: { id },
      })

      return {
        success: true,
        message: "Notification deleted successfully",
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete notification",
      })
    }
  }),

  /**
   * Get notification statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id as string;

      const [totalCount, unreadCount, typeStats] = await Promise.all([
        ctx.db.notification.count({
          where: { userId },
        }),
        ctx.db.notification.count({
          where: { userId, isRead: false },
        }),
        ctx.db.notification.groupBy({
          by: ["type"],
          where: { userId },
          _count: {
            type: true,
          },
        }),
      ])

      return {
        totalCount,
        unreadCount,
        typeDistribution: typeStats.reduce(
          (acc, stat) => {
            acc[stat.type] = stat._count.type
            return acc
          },
          {} as Record<string, number>,
        ),
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch notification statistics",
      })
    }
  }),
})
