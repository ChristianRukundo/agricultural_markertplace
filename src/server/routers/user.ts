import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure } from "@/lib/trpc/server"
import { locationSchema, paginationSchema } from "@/lib/utils/validation"

/**
 * User profile management and farmer listing router
 */
export const userRouter = createTRPCRouter({
  /**
   * Get current user's profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id as string

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
   * Get a list of all farmers with advanced filtering and sorting.
   */
  getFarmers: publicProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          district: z.string().optional(),
          specialization: z.string().optional(),
          minRating: z.number().min(0).max(5).optional(),
          sortBy: z.enum(["name", "rating", "products", "recent"]).default("rating"),
          ...paginationSchema.shape,
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, district, specialization, minRating, sortBy } = input

      const skip = (page - 1) * limit

      const where: any = {
        role: "FARMER",
        isVerified: true,
      }

      if (search) {
        where.profile = {
          ...where.profile,
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { farmerProfile: { bio: { contains: search, mode: "insensitive" } } },
          ],
        }
      }

      if (district) {
        where.profile = {
          ...where.profile,
          location: { contains: `"${district}"`, mode: "insensitive" },
        }
      }

      if (specialization) {
        where.profile = {
          ...where.profile,
          farmerProfile: {
            ...where.profile?.farmerProfile,
            certifications: { has: specialization },
          },
        }
      }

      let orderBy: any = {}
      switch (sortBy) {
        case "name":
          orderBy = { profile: { name: "asc" } }
          break
        case "products":
          orderBy = { profile: { farmerProfile: { products: { _count: "desc" } } } }
          break
        case "recent":
          orderBy = { createdAt: "desc" }
          break
        case "rating":
        default:
          orderBy = { createdAt: "desc" }
          break
      }

      const [farmers, total] = await ctx.db.$transaction([
        ctx.db.user.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            createdAt: true,
            profile: {
              select: {
                name: true,
                description: true,
                location: true,
                profilePictureUrl: true,
                farmerProfile: {
                  select: {
                    certifications: true,
                  },
                },
              },
            },
            _count: {
              select: {
                ordersAsFarmer: { where: { status: "DELIVERED" } },
              },
            },
          },
        }),
        ctx.db.user.count({ where }),
      ])

      const farmersWithRatings = await Promise.all(
        farmers.map(async (farmer) => {
          const ratingAggregation = await ctx.db.review.aggregate({
            where: {
              reviewedEntityId: farmer.id,
              reviewedEntityType: "FARMER",
              isApproved: true,
            },
            _avg: { rating: true },
            _count: { _all: true },
          })
          return {
            ...farmer,
            averageRating: ratingAggregation._avg.rating ?? 0,
            reviewCount: ratingAggregation._count._all,
          }
        }),
      )

      let filteredFarmers = farmersWithRatings
      if (minRating) {
        filteredFarmers = farmersWithRatings.filter((f) => f.averageRating >= minRating)
      }

      if (sortBy === "rating") {
        filteredFarmers.sort((a, b) => b.averageRating - a.averageRating)
      }

      return {
        farmers: filteredFarmers.map((f) => ({
          ...f,
          profile: {
            ...f.profile,
            // specializations are now correctly mapped from farmerProfile.certifications for the frontend
            specializations: f.profile?.farmerProfile?.certifications ? JSON.stringify(f.profile.farmerProfile.certifications) : "[]",
          },
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    }),

  getFarmerStats: publicProcedure.query(async ({ ctx }) => {
    const [totalFarmers, totalProducts, ratingAggregation, profiles] = await ctx.db.$transaction([
      ctx.db.user.count({ where: { role: "FARMER", isVerified: true } }),
      ctx.db.product.count({ where: { status: "ACTIVE" } }),
      ctx.db.review.aggregate({
        where: { reviewedEntityType: "FARMER", isApproved: true },
        _avg: { rating: true },
      }),
      ctx.db.profile.findMany({
        where: { user: { role: "FARMER", isVerified: true } },
        select: { location: true },
      }),
    ])

    const districts = new Set(
      profiles.map((p) => (p.location ? JSON.parse(p.location).district : null)).filter(Boolean),
    )

    return {
      totalFarmers,
      totalProducts,
      averageRating: ratingAggregation._avg.rating ?? 0,
      districtsCount: districts.size,
    }
  }),

  getFarmerProfile: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const farmer = await ctx.db.user.findUnique({
        where: { id: input.id, role: "FARMER" },
        select: {
          id: true,
          createdAt: true,
          profile: {
            select: {
              name: true,
              description: true,
              location: true,
              profilePictureUrl: true,
              contactEmail: true,
              contactPhone: true,
              createdAt: true,
              farmerProfile: {
                select: {
                  certifications: true,
                  _count: {
                    select: { products: { where: { status: 'ACTIVE' } } }
                  }
                }
              }
            },
          },
          _count: {
            select: {
              ordersAsFarmer: { where: { status: "DELIVERED" } },
            },
          },
        },
      })

      if (!farmer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Farmer not found." })
      }

      const ratingAggregation = await ctx.db.review.aggregate({
        where: {
          reviewedEntityId: farmer.id,
          reviewedEntityType: "FARMER",
          isApproved: true,
        },
        _avg: { rating: true },
        _count: { _all: true },
      })

      // Correctly structure the response to match frontend expectations
      return {
        ...farmer,
        averageRating: ratingAggregation._avg.rating ?? 0,
        _count: {
          receivedReviews: ratingAggregation._count._all,
          orders: farmer._count.ordersAsFarmer,
          products: farmer.profile?.farmerProfile?._count.products ?? 0,
        },
        profile: {
          ...farmer.profile,
          specializations: JSON.stringify(farmer.profile?.farmerProfile?.certifications || []),
        }
      }
    }),

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
        const userId = ctx.session.user.id as string

        const updatedProfile = await ctx.db.profile.update({
          where: { userId },
          data: {
            name: input.name,
            description: input.description,
            profilePictureUrl: input.profilePictureUrl,
            contactEmail: input.contactEmail,
            contactPhone: input.contactPhone,
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
        const userId = ctx.session.user.id as string

        if (ctx.session.user.role !== "FARMER") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only farmers can update farmer profile" })
        }

        const profile = await ctx.db.profile.findUnique({ where: { userId } })
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" })
        }

        const farmerProfile = await ctx.db.farmerProfile.upsert({
          where: { profileId: profile.id },
          update: input,
          create: { profileId: profile.id, ...input, certifications: input.certifications || [] },
        })

        return { success: true, message: "Farmer profile updated successfully", farmerProfile }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update farmer profile" })
      }
    }),

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
        const userId = ctx.session.user.id as string

        if (ctx.session.user.role !== "SELLER") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only sellers can update seller profile" })
        }

        const profile = await ctx.db.profile.findUnique({ where: { userId } })
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" })
        }

        const sellerProfile = await ctx.db.sellerProfile.upsert({
          where: { profileId: profile.id },
          update: input,
          create: { profileId: profile.id, ...input },
        })

        return { success: true, message: "Seller profile updated successfully", sellerProfile }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update seller profile" })
      }
    }),

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