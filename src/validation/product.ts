import { z } from "zod"
import { priceSchema, quantitySchema, paginationSchema, sortSchema } from "@/lib/utils/validation"

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().cuid("Invalid category ID"),
  quantityAvailable: quantitySchema,
  unitPrice: priceSchema,
  availabilityDate: z.date().min(new Date(), "Availability date cannot be in the past"),
  imageUrls: z.array(z.string().url()).min(1, "At least one image is required").max(5, "Maximum 5 images allowed"),
  minimumOrderQuantity: z.number().int().positive().default(1),
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().cuid("Invalid product ID"),
})

export const updateProductStatusSchema = z.object({
  id: z.string().cuid("Invalid product ID"),
  status: z.enum(["ACTIVE", "SOLD_OUT", "INACTIVE", "DRAFT"]),
})

export const getProductsSchema = z.object({
  categoryId: z.string().cuid().optional(),
  farmerId: z.string().cuid().optional(),
  status: z.enum(["ACTIVE", "SOLD_OUT", "INACTIVE", "DRAFT"]).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  search: z.string().optional(),
  location: z.string().optional(),
  ...paginationSchema.shape,
  ...sortSchema.shape,
})

export const getProductByIdSchema = z.object({
  id: z.string().cuid("Invalid product ID"),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>
export type GetProductsInput = z.infer<typeof getProductsSchema>
export type GetProductByIdInput = z.infer<typeof getProductByIdSchema>
