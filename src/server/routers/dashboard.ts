import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";

export const dashboardRouter = createTRPCRouter({

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session;
    const userId  = user.id as string;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    if (user.role === "FARMER") {
      const farmerProfile = await ctx.db.farmerProfile.findFirst({
        where: { profile: { userId: user.id as string } },
      });
      if (!farmerProfile) throw new TRPCError({ code: 'NOT_FOUND', message: 'Farmer profile not found.' });

      const [
        activeProductsCount,
        pendingOrdersCount,
        monthlySales,
        ratingAggregation,
      ] = await ctx.db.$transaction([
        ctx.db.product.count({ where: { farmerId: farmerProfile.id, status: 'ACTIVE' } }),
        ctx.db.order.count({ where: { farmerId: user.id as string, status: 'PENDING' } }),
        ctx.db.order.aggregate({
          _sum: { totalAmount: true },
          where: { farmerId: user.id as string, status: 'DELIVERED', orderDate: { gte: startOfMonth } },
        }),
        ctx.db.review.aggregate({
          where: { reviewedEntityId: user.id as string, reviewedEntityType: 'FARMER', isApproved: true },
          _avg: { rating: true },
          _count: { _all: true },
        }),
      ]);

      return {
        role: "FARMER",
        stats: {
          activeProductsCount,
          pendingOrdersCount,
          monthlySales: monthlySales._sum.totalAmount ?? 0,
          averageRating: ratingAggregation._avg.rating ?? 0,
          reviewCount: ratingAggregation._count._all,
        },
      };
    }

    if (user.role === "SELLER") {
      const [
        cartItemsCount,
        activeOrdersCount,
        monthlySpent,
        savedProductsCount,
      ] = await ctx.db.$transaction([
        ctx.db.cartItem.count({ where: { cart: { userId  } } }),
        ctx.db.order.count({ where: { sellerId: userId, status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY_FOR_DELIVERY'] } } }),
        ctx.db.order.aggregate({
          _sum: { totalAmount: true },
          where: { sellerId: userId, status: 'DELIVERED', orderDate: { gte: startOfMonth } },
        }),
        ctx.db.savedProduct.count({ where: { userId } }),
      ]);

      return {
        role: "SELLER",
        stats: {
          cartItemsCount,
          activeOrdersCount,
          monthlySpent: monthlySpent._sum.totalAmount ?? 0,
          savedProductsCount,
        },
      };
    }

    if (user.role === "ADMIN") {
      const [
        totalUsers,
        activeProducts,
        monthlyRevenue,
        usersThisMonth,
        usersLastMonth,
      ] = await ctx.db.$transaction([
        ctx.db.user.count(),
        ctx.db.product.count({ where: { status: 'ACTIVE' } }),
        ctx.db.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: 'DELIVERED', paymentStatus: { in: ['PAID', 'RELEASED'] }, orderDate: { gte: startOfMonth } },
        }),
        ctx.db.user.count({ where: { createdAt: { gte: startOfMonth } } }),
        ctx.db.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      ]);

      const userGrowthRate = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : (usersThisMonth > 0 ? 100 : 0);

      return {
        role: "ADMIN",
        stats: {
          totalUsers,
          activeProducts,
          monthlyRevenue: monthlyRevenue._sum.totalAmount ?? 0,
          userGrowthRate,
        },
      };
    }
    
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Invalid user role for dashboard stats." });
  }),
});