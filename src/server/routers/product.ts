import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/lib/trpc/server";
import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  getProductsSchema,
  getProductByIdSchema,
} from "@/validation/product";

/**
 * Product management router
 */
export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;

        if (ctx.session.user.role !== "FARMER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only farmers can create products",
          });
        }

        const profile = await ctx.db.profile.findUnique({
          where: { userId },
          include: { farmerProfile: true },
        });

        if (!profile?.farmerProfile) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Please complete your farmer profile first",
          });
        }

        const category = await ctx.db.category.findUnique({
          where: { id: input.categoryId },
        });

        if (!category) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        const product = await ctx.db.product.create({
          data: {
            ...input,
            farmerId: profile.farmerProfile.id,
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
        });

        return {
          success: true,
          message: "Product created successfully",
          product,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }
    }),

  getProducts: publicProcedure
    .input(getProductsSchema.default({}))
    .query(async ({ ctx, input }) => {
      try {
        const {
          page,
          limit,
          categoryId,
          farmerId,
          status,
          minPrice,
          maxPrice,
          search,
          location,
          sortBy,
          sortOrder,
        } = input;

        const skip = (page - 1) * limit;

        const where: any = {};

        if (categoryId) where.categoryId = categoryId;
        if (farmerId) where.farmerId = farmerId;
        if (status) where.status = status;
        else where.status = "ACTIVE";

        if (minPrice || maxPrice) {
          where.unitPrice = {};
          if (minPrice) where.unitPrice.gte = minPrice;
          if (maxPrice) where.unitPrice.lte = maxPrice;
        }

        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        if (location) {
          where.farmer = {
            profile: {
              location: { contains: location, mode: "insensitive" },
            },
          };
        }

        const orderBy: any = sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: "desc" };

        const [products, total] = await ctx.db.$transaction([
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
        ]);

        return {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products",
        });
      }
    }),

  getById: publicProcedure
    .input(getProductByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const product = await ctx.db.product.findUnique({
          where: { id: input.id },
          include: {
            category: true,
            farmer: {
              include: {
                profile: {
                  // This is the critical fix
                  include: {
                    user: {
                      select: { id: true },
                    },
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
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const avgRating = await ctx.db.review.aggregate({
          where: {
            reviewedEntityId: product.id,
            reviewedEntityType: "PRODUCT",
            isApproved: true,
          },
          _avg: {
            rating: true,
          },
        });

        return {
          ...product,
          averageRating: avgRating._avg.rating || 0,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch product",
        });
      }
    }),

  // ... rest of the file remains the same ...
  update: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;
        const { id, ...updateData } = input;

        const profile = await ctx.db.profile.findUnique({
          where: { userId },
          include: { farmerProfile: true },
        });

        if (!profile?.farmerProfile) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only farmers can update products",
          });
        }

        const product = await ctx.db.product.findUnique({
          where: { id },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        if (product.farmerId !== profile.farmerProfile.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update your own products",
          });
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
        });

        return {
          success: true,
          message: "Product updated successfully",
          product: updatedProduct,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product",
        });
      }
    }),

  updateStatus: protectedProcedure
    .input(updateProductStatusSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;
        const { id, status } = input;

        const profile = await ctx.db.profile.findUnique({
          where: { userId },
          include: { farmerProfile: true },
        });

        if (!profile?.farmerProfile) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only farmers can update product status",
          });
        }

        const product = await ctx.db.product.findUnique({
          where: { id },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        if (product.farmerId !== profile.farmerProfile.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update your own products",
          });
        }

        const updatedProduct = await ctx.db.product.update({
          where: { id },
          data: { status },
        });

        return {
          success: true,
          message: "Product status updated successfully",
          product: updatedProduct,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product status",
        });
      }
    }),

  delete: protectedProcedure
    .input(getProductByIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;
        const { id } = input;

        const profile = await ctx.db.profile.findUnique({
          where: { userId },
          include: { farmerProfile: true },
        });

        if (!profile?.farmerProfile) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only farmers can delete products",
          });
        }

        const product = await ctx.db.product.findUnique({
          where: { id },
          include: {
            orderItems: true,
          },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        if (product.farmerId !== profile.farmerProfile.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own products",
          });
        }

        if (product.orderItems.length > 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Cannot delete product with existing orders",
          });
        }

        await ctx.db.product.delete({
          where: { id },
        });

        return {
          success: true,
          message: "Product deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete product",
        });
      }
    }),

  getMyProducts: protectedProcedure
    .input(getProductsSchema.omit({ farmerId: true }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;

        const profile = await ctx.db.profile.findUnique({
          where: { userId },
          include: { farmerProfile: true },
        });

        if (!profile?.farmerProfile) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only farmers can view their products",
          });
        }

        const {
          page,
          limit,
          categoryId,
          status,
          minPrice,
          maxPrice,
          search,
          sortBy,
          sortOrder,
        } = input;

        const skip = (page - 1) * limit;

        const where: any = {
          farmerId: profile.farmerProfile.id,
        };

        if (categoryId) where.categoryId = categoryId;
        if (status) where.status = status;

        if (minPrice || maxPrice) {
          where.unitPrice = {};
          if (minPrice) where.unitPrice.gte = minPrice;
          if (maxPrice) where.unitPrice.lte = maxPrice;
        }

        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const orderBy: any = sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: "desc" };

        const [products, total] = await ctx.db.$transaction([
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
        ]);

        return {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch your products",
        });
      }
    }),
});
