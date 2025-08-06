import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import {
  getNotificationsSchema,
  markNotificationAsReadSchema,
  markAllNotificationsAsReadSchema,
  NotificationType,
} from "@/validation/notification";

/**
 * Notification management router
 */
export const notificationRouter = createTRPCRouter({
  /**
   * Get user's notifications
   */
  getNotifications: protectedProcedure
    .input(getNotificationsSchema)
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User session not found.",
          });
        }
        const userId = ctx.session.user.id;
        const { isRead, type, page, limit } = input;

        const skip = (page - 1) * limit;

        const where: {
          userId: string;
          isRead?: boolean;
          type?: NotificationType;
        } = { userId };
        if (isRead !== undefined) where.isRead = isRead;
        if (type) where.type = type;

        // FIX: Execute queries sequentially to ensure compatibility with connection poolers.
        const total = await ctx.db.notification.count({ where });
        const notifications = await ctx.db.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        });
        const unreadCount = await ctx.db.notification.count({
          where: { userId, isRead: false },
        });

        return {
          notifications,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          unreadCount,
        };
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notifications",
        });
      }
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(markNotificationAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User session not found.",
          });
        }
        const userId = ctx.session.user.id;
        const { id } = input;

        const notification = await ctx.db.notification.findFirst({
          where: { id, userId }, // Combine find and ownership check
        });

        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Notification not found or you do not have permission to access it.",
          });
        }

        const updatedNotification = await ctx.db.notification.update({
          where: { id },
          data: { isRead: true },
        });

        return {
          success: true,
          message: "Notification marked as read",
          notification: updatedNotification,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Failed to mark notification as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notification as read",
        });
      }
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure
    .input(markAllNotificationsAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User session not found.",
          });
        }
        const userId = ctx.session.user.id;
        const { type } = input;

        const where: {
          userId: string;
          isRead: boolean;
          type?: NotificationType;
        } = { userId, isRead: false };
        if (type) where.type = type;

        const result = await ctx.db.notification.updateMany({
          where,
          data: { isRead: true },
        });

        return {
          success: true,
          message: `${result.count} notifications marked as read`,
          count: result.count,
        };
      } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notifications as read",
        });
      }
    }),

  /**
   * Delete notification
   */
  delete: protectedProcedure
    .input(markNotificationAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User session not found.",
          });
        }
        const userId = ctx.session.user.id;
        const { id } = input;

        const notification = await ctx.db.notification.findFirst({
          where: { id, userId },
        });

        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Notification not found or you do not have permission to delete it.",
          });
        }

        await ctx.db.notification.delete({ where: { id } });

        return {
          success: true,
          message: "Notification deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Failed to delete notification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete notification",
        });
      }
    }),

  /**
   * Get notification statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User session not found.",
        });
      }
      const userId = ctx.session.user.id;

      const totalCount = await ctx.db.notification.count({ where: { userId } });
      const unreadCount = await ctx.db.notification.count({
        where: { userId, isRead: false },
      });
      const allNotifications = await ctx.db.notification.findMany({
        where: { userId },
        select: { type: true },
      });

      const typeDistribution = allNotifications.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {} as Record<NotificationType, number>);

      return {
        totalCount,
        unreadCount,
        typeDistribution,
      };
    } catch (error) {
      console.error("Failed to fetch notification stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch notification statistics",
      });
    }
  }),
});
