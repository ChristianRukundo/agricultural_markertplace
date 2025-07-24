import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/server"
import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  getProductsSchema,
  getProductByIdSchema,
} from "@/validation/product"

/**
 * Product management router
 */
export const productRouter = createTRPCRouter({
  /**
   * Create a new product (farmers only)
   */
  create: protectedProcedure.input(createProductSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id as string // Cast userId to string

      // Verify user is a farmer
      if (ctx.session.user.role !== "FARMER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only farmers can create products",
        })
      }

      // Get farmer profile
      const profile = await ctx.db.profile.findUnique({
        where: { userId },
        include: { farmerProfile: true },
      })

      // Ensure profile and farmerProfile exist
      if (!profile || !profile.farmerProfile) { // Added check for profile
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Please complete your farmer profile first",
        })
      }

      // Verify category exists
      const category = await ctx.db.category.findUnique({
        where: { id: input.categoryId },
      })

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        })
      }

      const product = await ctx.db.product.create({
        data: {
          ...input,
          farmerId: profile.farmerProfile.id, // Now TypeScript knows farmerProfile exists
        },
        include: {
          category: true,
          farmer: {
            include: {
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

      return {
        success: true,
        message: "Product created successfully",
        product,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create product",
      })
    }
  }),

  /**
   * Get products with filtering and pagination
   */
  getProducts: publicProcedure.input(getProductsSchema).query(async ({ ctx, input }) => {
    try {
      const { page, limit, categoryId, farmerId, status, minPrice, maxPrice, search, location, sortBy, sortOrder } =
        input

      const skip = (page - 1) * limit

      // Build where clause
      const where: any = {}

      if (categoryId) where.categoryId = categoryId
      if (farmerId) where.farmerId = farmerId
      if (status) where.status = status
      else where.status = "ACTIVE" // Default to active products for public view

      if (minPrice || maxPrice) {
        where.unitPrice = {}
        if (minPrice) where.unitPrice.gte = minPrice
        if (maxPrice) where.unitPrice.lte = maxPrice
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      }

      if (location) {
        where.farmer = {
          profile: {
            location: { contains: location, mode: "insensitive" },
          },
        }
      }

      // Build orderBy clause
      let orderBy: any = { createdAt: "desc" }
      if (sortBy) {
        orderBy = { [sortBy]: sortOrder }
      }

      const [products, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            category: true,
            farmer: {
              include: {
                profile: {
                  select: {
                    name: true,
                    profilePictureUrl: true,
                    location: true,
                  },
                },
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        }),
        ctx.db.product.count({ where }),
      ])

      return {
        products,
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
        message: "Failed to fetch products",
      })
    }
  }),

  /**
   * Get product by ID
   */
  getById: publicProcedure.input(getProductByIdSchema).query(async ({ ctx, input }) => {
    try {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          farmer: {
            include: {
              profile: {
                select: {
                  name: true,
                  profilePictureUrl: true,
                  location: true,
                  description: true,
                  contactEmail: true,
                  contactPhone: true,
                },
              },
            },
          },
          reviews: {
            where: { isApproved: true },
            include: {
              reviewer: {
                select: {
                  profile: {
                    select: {
                      name: true,
                      profilePictureUrl: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          _count: {
            select: {
              reviews: true,
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

      // Calculate average rating
      const avgRating = await ctx.db.review.aggregate({
        where: {
          reviewedEntityId: product.id,
          reviewedEntityType: "PRODUCT",
          isApproved: true,
        },
        _avg: {
          rating: true,
        },
      })

      return {
        ...product,
        averageRating: avgRating._avg.rating || 0,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch product",
      })
    }
  }),

  /**
   * Update product (owner only)
   */
  update: protectedProcedure.input(updateProductSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id as string // Cast userId to string
      const { id, ...updateData } = input

      // Get user's farmer profile
      const profile = await ctx.db.profile.findUnique({
        where: { userId },
        include: { farmerProfile: true },
      })

      if (!profile || !profile.farmerProfile) { // Added check for profile
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only farmers can update products",
        })
      }

      // Verify product ownership
      const product = await ctx.db.product.findUnique({
        where: { id },
      })

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        })
      }

      if (product.farmerId !== profile.farmerProfile.id) { // Now TypeScript knows farmerProfile exists
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own products",
        })
      }

      const updatedProduct = await ctx.db.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          farmer: {
            include: {
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

      return {
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update product",
      })
    }
  }),

  /**
   * Update product status
   */
  updateStatus: protectedProcedure.input(updateProductStatusSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id as string // Cast userId to string
      const { id, status } = input

      // Get user's farmer profile
      const profile = await ctx.db.profile.findUnique({
        where: { userId },
        include: { farmerProfile: true },
      })

      if (!profile || !profile.farmerProfile) { // Added check for profile
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only farmers can update product status",
        })
      }

      // Verify product ownership
      const product = await ctx.db.product.findUnique({
        where: { id },
      })

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        })
      }

      if (product.farmerId !== profile.farmerProfile.id) { // Now TypeScript knows farmerProfile exists
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own products",
        })
      }

      const updatedProduct = await ctx.db.product.update({
        where: { id },
        data: { status },
      })

      return {
        success: true,
        message: "Product status updated successfully",
        product: updatedProduct,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update product status",
      })
    }
  }),

  /**
   * Delete product (owner only)
   */
  delete: protectedProcedure.input(getProductByIdSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id as string // Cast userId to string
      const { id } = input

      // Get user's farmer profile
      const profile = await ctx.db.profile.findUnique({
        where: { userId },
        include: { farmerProfile: true },
      })

      if (!profile || !profile.farmerProfile) { // Added check for profile
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only farmers can delete products",
        })
      }

      // Verify product ownership
      const product = await ctx.db.product.findUnique({
        where: { id },
        include: {
          orderItems: true,
        },
      })

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        })
      }

      if (product.farmerId !== profile.farmerProfile.id) { // Now TypeScript knows farmerProfile exists
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own products",
        })
      }

      // Check if product has active orders
      if (product.orderItems.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete product with existing orders",
        })
      }

      await ctx.db.product.delete({
        where: { id },
      })

      return {
        success: true,
        message: "Product deleted successfully",
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete product",
      })
    }
  }),

  /**
   * Get farmer's products
   */
  getMyProducts: protectedProcedure.input(getProductsSchema.omit({ farmerId: true })).query(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id as string // Cast userId to string

      // Get user's farmer profile
      const profile = await ctx.db.profile.findUnique({
        where: { userId },
        include: { farmerProfile: true },
      })

      if (!profile || !profile.farmerProfile) { // Added check for profile
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only farmers can view their products",
        })
      }

      const { page, limit, categoryId, status, minPrice, maxPrice, search, sortBy, sortOrder } = input

      const skip = (page - 1) * limit

      // Build where clause
      const where: any = {
        farmerId: profile.farmerProfile.id, // Now TypeScript knows farmerProfile exists
      }

      if (categoryId) where.categoryId = categoryId
      if (status) where.status = status

      if (minPrice || maxPrice) {
        where.unitPrice = {}
        if (minPrice) where.unitPrice.gte = minPrice
        if (maxPrice) where.unitPrice.lte = maxPrice
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      }

      // Build orderBy clause
      let orderBy: any = { createdAt: "desc" }
      if (sortBy) {
        orderBy = { [sortBy]: sortOrder }
      }

      const [products, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            category: true,
            _count: {
              select: {
                reviews: true,
                orderItems: true,
              },
            },
          },
        }),
        ctx.db.product.count({ where }),
      ])

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch your products",
      })
    }
  }),
})