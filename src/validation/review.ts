import { z } from "zod"
import { ratingSchema, paginationSchema, sortSchema } from "@/lib/utils/validation"

export const createReviewSchema = z.object({
  reviewedEntityId: z.string().cuid("Invalid entity ID"),
  reviewedEntityType: z.enum(["PRODUCT", "FARMER"]),
  rating: ratingSchema,
  comment: z
    .string()
    .min(5, "Review comment must be at least 5 characters")
    .max(500, "Review comment too long")
    .optional(),
})

export const getReviewsSchema = z.object({
  reviewedEntityId: z.string().cuid("Invalid entity ID"),
  reviewedEntityType: z.enum(["PRODUCT", "FARMER"]),
  rating: z.number().int().min(1).max(5).optional(),
  isApproved: z.boolean().optional(),
  ...paginationSchema.shape,
  ...sortSchema.shape,
})

export const moderateReviewSchema = z.object({
  id: z.string().cuid("Invalid review ID"),
  isApproved: z.boolean(),
  moderationNotes: z.string().optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type GetReviewsInput = z.infer<typeof getReviewsSchema>
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>
