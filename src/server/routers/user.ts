import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/lib/trpc/server"
import { locationSchema } from "@/lib/utils/validation"

/**
 * User profile management router
 */
export const userRouter = createTRPCRouter({
  /**
   * Get current user's profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id

      const profile = await ctx.db.profile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              phoneNumber: true,
              isVerified: true,
              createdAt: true,
            },
          },
          farmerProfile: true,
          sellerProfile: true,
        },
      })

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        })
      }

      return profile
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch profile",
      })
    }
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters").optional(),
        location: locationSchema.optional(),
        description: z.string().max(500, "Description too long").optional(),
        profilePictureUrl: z.string().url().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        socialLinks: z.record(z.string().url()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id

        const updatedProfile = await ctx.db.profile.update({
          where: { userId },
          data: {
            ...input,
            location: input.location ? JSON.stringify(input.location) : undefined,
            socialLinks: input.socialLinks || undefined,
          },
        })

        return {
          success: true,
          message: "Profile updated successfully",
          profile: updatedProfile,
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        })
      }
    }),

  /**
   * Update farmer-specific profile
   */
  updateFarmerProfile: protectedProcedure
    .input(
      z.object({
        farmName: z.string().min(2, "Farm name must be at least 2 characters"),
        farmLocationDetails: z.string().min(5, "Farm location details required"),
        farmCapacity: z.enum(["SMALL", "MEDIUM", "LARGE"]),
        certifications: z.array(z.string()).optional(),
        gpsCoordinates: z.string().optional(),
        bio: z.string().max(1000, "Bio too long").optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id

        // Verify user is a farmer
        if (ctx.session.user.role !== "FARMER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only farmers can update farmer profile",
          })
        }

        // Get user's profile ID
        const profile = await ctx.db.profile.findUnique({
          where: { userId },
        })

        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profile not found",
          })
        }

        // Upsert farmer profile
        const farmerProfile = await ctx.db.farmerProfile.upsert({
          where: { profileId: profile.id },
          update: input,
          create: {
            profileId: profile.id,
            ...input,
            certifications: input.certifications || [],
          },
        })

        return {
          success: true,
          message: "Farmer profile updated successfully",
          farmerProfile,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update farmer profile",
        })
      }
    }),

  /**
   * Update seller-specific profile
   */
  updateSellerProfile: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(2, "Business name must be at least 2 characters"),
        deliveryOptions: z.array(z.string()).min(1, "At least one delivery option required"),
        businessRegistrationNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id

        // Verify user is a seller
        if (ctx.session.user.role !== "SELLER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only sellers can update seller profile",
          })
        }

        // Get user's profile ID
        const profile = await ctx.db.profile.findUnique({
          where: { userId },
        })

        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profile not found",
          })
        }

        // Upsert seller profile
        const sellerProfile = await ctx.db.sellerProfile.upsert({
          where: { profileId: profile.id },
          update: input,
          create: {
            profileId: profile.id,
            ...input,
          },
        })

        return {
          success: true,
          message: "Seller profile updated successfully",
          sellerProfile,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update seller profile",
        })
      }
    }),

  /**
   * Get user profile by ID (public info only)
   */
  getPublicProfile: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid("Invalid user ID"),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const profile = await ctx.db.profile.findUnique({
          where: { userId: input.userId },
          select: {
            id: true,
            name: true,
            location: true,
            description: true,
            profilePictureUrl: true,
            socialLinks: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                role: true,
                isVerified: true,
                createdAt: true,
              },
            },
            farmerProfile: {
              select: {
                farmName: true,
                farmCapacity: true,
                certifications: true,
                bio: true,
              },
            },
            sellerProfile: {
              select: {
                businessName: true,
                deliveryOptions: true,
              },
            },
          },
        })

        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profile not found",
          })
        }

        return profile
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch profile",
        })
      }
    }),

  /**
   * Update user role (admin only)
   */
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid("Invalid user ID"),
        role: z.enum(["FARMER", "SELLER", "ADMIN"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, role } = input

        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: { role },
        })

        return {
          success: true,
          message: "User role updated successfully",
          user: updatedUser,
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user role",
        })
      }
    }),
})
