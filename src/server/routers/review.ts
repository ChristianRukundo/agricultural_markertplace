import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/lib/trpc/server"
import { createReviewSchema, getReviewsSchema, moderateReviewSchema } from "@/validation/review"

/**
 * Review management router
 */
export const reviewRouter = createTRPCRouter({
  /**
   * Create a new review
   */
  create: protectedProcedure.input(createReviewSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const { reviewedEntityId, reviewedEntityType, rating, comment } = input

      // Check if user has already reviewed this entity
      const existingReview = await ctx.db.review.findFirst({
        where: {
          reviewedEntityId,
          reviewedEntityType,
          reviewerId: userId,
        },
      })

      if (existingReview) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this item",
        })
      }

      // Verify entity exists and user has permission to review
      if (reviewedEntityType === "PRODUCT") {
        const product = await ctx.db.product.findUnique({
          where: { id: reviewedEntityId },
          include: {
            farmer: {
              include: {
                profile: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        })

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          })
        }

        // Check if user has ordered this product
        const hasOrdered = await ctx.db.orderItem.findFirst({
          where: {
            productId: reviewedEntityId,
            order: {
              sellerId: userId,
              status: "DELIVERED",
            },
          },
        })

        if (!hasOrdered) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only review products you have purchased and received",
          })
        }
      } else if (reviewedEntityType === "FARMER") {
        const farmer = await ctx.db.user.findUnique({
          where: { id: reviewedEntityId, role: "FARMER" },
        })

        if (!farmer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Farmer not found",
          })
        }

        // Check if user has had transactions with this farmer
        const hasTransacted = await ctx.db.order.findFirst({
          where: {
            sellerId: userId,
            farmerId: reviewedEntityId,
            status: "DELIVERED",
          },
        })

        if (!hasTransacted) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only review farmers you have transacted with",
          })
        }
      }

      const review = await ctx.db.review.create({
        data: {
          reviewedEntityId,
          reviewedEntityType,
          reviewerId: userId,
          rating,
          comment,
        },
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
        },
      })

      // Create notification for the reviewed entity owner
      let notificationUserId: string | null = null
      let notificationContent = ""

      if (reviewedEntityType === "PRODUCT") {
        const product = await ctx.db.product.findUnique({
          where: { id: reviewedEntityId },
          include: {
            farmer: {
              include: {
                profile: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        })
        notificationUserId = product?.farmer.profile.user.id || null
        notificationContent = `New ${rating}-star review received for your product`
      } else if (reviewedEntityType === "FARMER") {
        notificationUserId = reviewedEntityId
        notificationContent = `New ${rating}-star review received for your farm`
      }

      if (notificationUserId) {
        await ctx.db.notification.create({
          data: {
            userId: notificationUserId,
            type: "REVIEW_RECEIVED",
            content: notificationContent,
            relatedEntityId: review.id,
          },
        })
      }

      return {
        success: true,
        message: "Review submitted successfully",
        review,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create review",
      })
    }
  }),

  /**
   * Get reviews for an entity
   */
  getReviews: protectedProcedure.input(getReviewsSchema).query(async ({ ctx, input }) => {
    try {
      const { reviewedEntityId, reviewedEntityType, rating, isApproved, page, limit, sortBy, sortOrder } = input

      const skip = (page - 1) * limit

      // Build where clause
      const where: any = {
        reviewedEntityId,
        reviewedEntityType,
      }

      if (rating) where.rating = rating
      if (isApproved !== undefined) where.isApproved = isApproved
      else where.isApproved = true // Default to approved reviews for public view

      // Build orderBy clause
      let orderBy: any = { createdAt: "desc" }
      if (sortBy) {
        orderBy = { [sortBy]: sortOrder }
      }

      const [reviews, total, ratingStats] = await Promise.all([
        ctx.db.review.findMany({
          where,
          skip,
          take: limit,
          orderBy,
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
          },
        }),
        ctx.db.review.count({ where }),
        ctx.db.review.groupBy({
          by: ["rating"],
          where: {
            reviewedEntityId,
            reviewedEntityType,
            isApproved: true,
          },
          _count: {
            rating: true,
          },
        }),
      ])

      // Calculate average rating
      const avgRating = await ctx.db.review.aggregate({
        where: {
          reviewedEntityId,
          reviewedEntityType,
          isApproved: true,
        },
        _avg: {
          rating: true,
        },
      })

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats: {
          averageRating: avgRating._avg.rating || 0,
          ratingDistribution: ratingStats.reduce(
            (acc, stat) => {
              acc[stat.rating] = stat._count.rating
              return acc
            },
            {} as Record<number, number>,
          ),
        },
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch reviews",
      })
    }
  }),

  /**
   * Get user's reviews
   */
  getMyReviews: protectedProcedure
    .input(getReviewsSchema.omit({ reviewedEntityId: true, reviewedEntityType: true }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id
        const { rating, isApproved, page, limit, sortBy, sortOrder } = input

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {
          reviewerId: userId,
        }

        if (rating) where.rating = rating
        if (isApproved !== undefined) where.isApproved = isApproved

        // Build orderBy clause
        let orderBy: any = { createdAt: "desc" }
        if (sortBy) {
          orderBy = { [sortBy]: sortOrder }
        }

        const [reviews, total] = await Promise.all([
          ctx.db.review.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrls: true,
                },
              },
            },
          }),
          ctx.db.review.count({ where }),
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
          message: "Failed to fetch your reviews",
        })
      }
    }),

  /**
   * Moderate review (admin only)
   */
  moderate: adminProcedure.input(moderateReviewSchema).mutation(async ({ ctx, input }) => {
    try {
      const { id, isApproved, moderationNotes } = input

      const review = await ctx.db.review.findUnique({
        where: { id },
      })

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        })
      }

      const updatedReview = await ctx.db.review.update({
        where: { id },
        data: {
          isApproved,
          // TODO: Add moderationNotes field to schema if needed
        },
      })

      // Notify reviewer about moderation decision
      await ctx.db.notification.create({
        data: {
          userId: review.reviewerId,
          type: "SYSTEM_ANNOUNCEMENT",
          content: isApproved
            ? "Your review has been approved and is now visible"
            : "Your review has been rejected and will not be displayed",
          relatedEntityId: id,
        },
      })

      return {
        success: true,
        message: `Review ${isApproved ? "approved" : "rejected"} successfully`,
        review: updatedReview,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to moderate review",
      })
    }
  }),

  /**
   * Delete review (owner or admin only)
   */
  delete: protectedProcedure.input(moderateReviewSchema.pick({ id: true })).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const userRole = ctx.session.user.role
      const { id } = input

      const review = await ctx.db.review.findUnique({
        where: { id },
      })

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        })
      }

      // Check permissions
      if (review.reviewerId !== userId && userRole !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own reviews",
        })
      }

      await ctx.db.review.delete({
        where: { id },
      })

      return {
        success: true,
        message: "Review deleted successfully",
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete review",
      })
    }
  }),
})
