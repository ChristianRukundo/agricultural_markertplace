import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import {
  addItemToCartSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from "@/validation/cart";

// Helper function to get or create a cart for a user
async function getOrCreateCart(db: any, userId: string) {
  let cart = await db.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId } });
  }
  return cart;
}

export const cartRouter = createTRPCRouter({
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id as string;
    const cart = await getOrCreateCart(ctx.db, userId);
    return ctx.db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }),

  addItem: protectedProcedure
    .input(addItemToCartSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;
      const { productId, quantity } = input;

      const cart = await getOrCreateCart(ctx.db, userId);

      const existingItem = await ctx.db.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      if (existingItem) {
        await ctx.db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        await ctx.db.cartItem.create({
          data: { cartId: cart.id, productId, quantity },
        });
      }
      return { success: true, message: "Item added to cart." };
    }),

  updateItemQuantity: protectedProcedure
    .input(updateCartItemSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;
      const { productId, quantity } = input;

      const cart = await ctx.db.cart.findUnique({ where: { userId } });
      if (!cart)
        throw new TRPCError({ code: "NOT_FOUND", message: "Cart not found." });

      await ctx.db.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity },
      });

      return { success: true, message: "Cart updated." };
    }),

  removeItem: protectedProcedure
    .input(removeCartItemSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;
      const { productId } = input;

      const cart = await ctx.db.cart.findUnique({ where: { userId } });
      if (!cart)
        throw new TRPCError({ code: "NOT_FOUND", message: "Cart not found." });

      await ctx.db.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      return { success: true, message: "Item removed from cart." };
    }),
});
