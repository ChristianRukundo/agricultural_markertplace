import { z } from "zod";

export const addItemToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1),
});

export const updateCartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1),
});

export const removeCartItemSchema = z.object({
  productId: z.string().cuid(),
});