import { z } from "zod"
import { paginationSchema, sortSchema } from "@/lib/utils/validation"

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid("Invalid product ID"),
        quantity: z.number().int().positive("Quantity must be positive"),
      }),
    )
    .min(1, "At least one item is required"),
  deliveryAddress: z.string().min(10, "Delivery address must be at least 10 characters"),
  notes: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  id: z.string().cuid("Invalid order ID"),
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "READY_FOR_DELIVERY", "DELIVERED", "CANCELLED", "DISPUTED"]),
  notes: z.string().optional(),
})

export const cancelOrderSchema = z.object({
  id: z.string().cuid("Invalid order ID"),
  reason: z.string().min(5, "Cancellation reason must be at least 5 characters"),
})

export const getOrdersSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "READY_FOR_DELIVERY", "DELIVERED", "CANCELLED", "DISPUTED"])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "ESCROWED", "RELEASED"]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  ...paginationSchema.shape,
  ...sortSchema.shape,
})

export const getOrderByIdSchema = z.object({
  id: z.string().cuid("Invalid order ID"),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>
export type GetOrdersInput = z.infer<typeof getOrdersSchema>
export type GetOrderByIdInput = z.infer<typeof getOrderByIdSchema>
