import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import { toggleSavedProductSchema } from "@/validation/savedProduct";

export const savedProductRouter = createTRPCRouter({
    toggle: protectedProcedure.input(toggleSavedProductSchema).mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id as string;
        const { productId } = input;

        const existing = await ctx.db.savedProduct.findUnique({
            where: { userId_productId: { userId, productId } }
        });

        if (existing) {
            await ctx.db.savedProduct.delete({
                where: { userId_productId: { userId, productId } }
            });
            return { success: true, status: 'removed', message: "Product removed from saved items." };
        } else {
            await ctx.db.savedProduct.create({
                data: { userId, productId }
            });
            return { success: true, status: 'added', message: "Product saved." };
        }
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id as string;
        return ctx.db.savedProduct.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        });
    }),
});