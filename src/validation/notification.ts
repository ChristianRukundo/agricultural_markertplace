import { z } from "zod";
import { paginationSchema } from "@/lib/utils/validation";

// Define a union type for all possible notification types
export const NotificationTypeEnum = z.enum([
  "ORDER_CREATED",
  "ORDER_UPDATED",
  "PAYMENT_RECEIVED",
  "MESSAGE_RECEIVED",
  "REVIEW_RECEIVED",
  "SYSTEM_ANNOUNCEMENT",
  "ORDER_PLACED", 
  "ORDER_CONFIRMED", 
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "PRODUCT_APPROVED",
  "PRODUCT_REJECTED",
]);

export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export const getNotificationsSchema = z.object({
  isRead: z.boolean().optional(),
  type: NotificationTypeEnum.optional(), // Use the unified enum
  ...paginationSchema.shape,
});

export const markNotificationAsReadSchema = z.object({
  id: z.string().cuid("Invalid notification ID"),
});

export const markAllNotificationsAsReadSchema = z.object({
  type: NotificationTypeEnum.optional(), // Use the unified enum
});

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
export type MarkNotificationAsReadInput = z.infer<
  typeof markNotificationAsReadSchema
>;
export type MarkAllNotificationsAsReadInput = z.infer<
  typeof markAllNotificationsAsReadSchema
>;
