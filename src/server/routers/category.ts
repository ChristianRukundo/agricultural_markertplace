import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/lib/trpc/server"
import { paginationSchema, sortSchema } from "@/lib/utils/validation"

/**
 * Category management router
 */
export const categoryRouter = createTRPCRouter({
  /**
   * Get all categories
   */
  getAll: publicProcedure
    .input(
      z.object({
        includeProductCount: z.boolean().default(false),
        ...paginationSchema.shape,
        ...sortSchema.shape,
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { includeProductCount, page, limit, sortBy, sortOrder } = input
        const skip = (page - 1) * limit

        // Build orderBy clause
        let orderBy: any = { name: "asc" }
        if (sortBy) {
          orderBy = { [sortBy]: sortOrder }
        }

        const [categories, total] = await Promise.all([
          ctx.db.category.findMany({
            skip,
            take: limit,
            orderBy,
            include: includeProductCount
              ? {
                  _count: {
                    select: {
                      products: {
                        where: {
                          status: "ACTIVE",
                        },
                      },
                    },
                  },
                }
              : undefined,
          }),
          ctx.db.category.count(),
        ])

        return {
          categories,
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
          message: "Failed to fetch categories",
        })
      }
    }),

  /**
   * Get category by ID
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid category ID"),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const category = await ctx.db.category.findUnique({
          where: { id: input.id },
          include: {
            _count: {
              select: {
                products: {
                  where: {
                    status: "ACTIVE",
                  },
                },
              },
            },
          },
        })

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          })
        }

        return category
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch category",
        })
      }
    }),

  /**
   * Create category (admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2, "Category name must be at least 2 characters"),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if category already exists
        const existingCategory = await ctx.db.category.findUnique({
          where: { name: input.name },
        })

        if (existingCategory) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Category with this name already exists",
          })
        }

        const category = await ctx.db.category.create({
          data: input,
        })

        return {
          success: true,
          message: "Category created successfully",
          category,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create category",
        })
      }
    }),

  /**
   * Update category (admin only)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid category ID"),
        name: z.string().min(2, "Category name must be at least 2 characters").optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input

        const category = await ctx.db.category.findUnique({
          where: { id },
        })

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          })
        }

        // Check if name is being updated and if it conflicts
        if (updateData.name && updateData.name !== category.name) {
          const existingCategory = await ctx.db.category.findUnique({
            where: { name: updateData.name },
          })

          if (existingCategory) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Category with this name already exists",
            })
          }
        }

        const updatedCategory = await ctx.db.category.update({
          where: { id },
          data: updateData,
        })

        return {
          success: true,
          message: "Category updated successfully",
          category: updatedCategory,
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update category",
        })
      }
    }),

  /**
   * Delete category (admin only)
   */
  delete: adminProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid category ID"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = input

        const category = await ctx.db.category.findUnique({
          where: { id },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        })

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          })
        }

        // Check if category has products
        if (category._count.products > 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Cannot delete category with existing products",
          })
        }

        await ctx.db.category.delete({
          where: { id },
        })

        return {
          success: true,
          message: "Category deleted successfully",
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete category",
        })
      }
    }),

  /**
   * Get category statistics (admin only)
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    try {
      const [totalCategories, categoriesWithProducts, categoryStats] = await Promise.all([
        ctx.db.category.count(),
        ctx.db.category.count({
          where: {
            products: {
              some: {
                status: "ACTIVE",
              },
            },
          },
        }),
        ctx.db.category.findMany({
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                products: {
                  where: {
                    status: "ACTIVE",
                  },
                },
              },
            },
          },
          orderBy: {
            products: {
              _count: "desc",
            },
          },
          take: 10,
        }),
      ])

      return {
        totalCategories,
        categoriesWithProducts,
        emptyCategories: totalCategories - categoriesWithProducts,
        topCategories: categoryStats,
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch category statistics",
      })
    }
  }),
})
