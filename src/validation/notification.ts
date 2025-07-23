import { z } from "zod"
import { paginationSchema } from "@/lib/utils/validation"

export const getNotificationsSchema = z.object({
  isRead: z.boolean().optional(),
  type: z
    .enum([
      "ORDER_CREATED",
      "ORDER_UPDATED",
      "PAYMENT_RECEIVED",
      "MESSAGE_RECEIVED",
      "REVIEW_RECEIVED",
      "SYSTEM_ANNOUNCEMENT",
    ])
    .optional(),
  ...paginationSchema.shape,
})

export const markNotificationAsReadSchema = z.object({
  id: z.string().cuid("Invalid notification ID"),
})

export const markAllNotificationsAsReadSchema = z.object({
  type: z
    .enum([
      "ORDER_CREATED",
      "ORDER_UPDATED",
      "PAYMENT_RECEIVED",
      "MESSAGE_RECEIVED",
      "REVIEW_RECEIVED",
      "SYSTEM_ANNOUNCEMENT",
    ])
    .optional(),
})

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>
export type MarkNotificationAsReadInput = z.infer<typeof markNotificationAsReadSchema>
export type MarkAllNotificationsAsReadInput = z.infer<typeof markAllNotificationsAsReadSchema>
