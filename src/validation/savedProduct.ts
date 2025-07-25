import { z } from "zod";

export const toggleSavedProductSchema = z.object({
  productId: z.string().cuid(),
});