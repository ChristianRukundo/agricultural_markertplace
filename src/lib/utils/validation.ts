import { z } from "zod"

/**
 * Common validation schemas used across the application
 */

export const emailSchema = z.string().email("Invalid email address").min(1, "Email is required")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  )

export const phoneNumberSchema = z
  .string()
  .regex(/^(\+250|0)(7[0-9]{8})$/, "Invalid Rwandan phone number format. Use +250XXXXXXXXX or 07XXXXXXXX")

export const priceSchema = z.number().positive("Price must be positive").max(999999.99, "Price is too high")

export const quantitySchema = z.number().int("Quantity must be a whole number").positive("Quantity must be positive")

export const ratingSchema = z
  .number()
  .int("Rating must be a whole number")
  .min(1, "Rating must be at least 1")
  .max(5, "Rating cannot exceed 5")

export const locationSchema = z.object({
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  sector: z.string().min(1, "Sector is required"),
  address: z.string().optional(),
})

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})
