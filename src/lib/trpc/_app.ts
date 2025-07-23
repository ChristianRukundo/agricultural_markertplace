import { createTRPCRouter } from "@/lib/trpc/server"
import { authRouter } from "@/server/routers/auth"
import { userRouter } from "@/server/routers/user"
import { productRouter } from "@/server/routers/product"
import { orderRouter } from "@/server/routers/order"
import { chatRouter } from "@/server/routers/chat"
import { reviewRouter } from "@/server/routers/review"
import { notificationRouter } from "@/server/routers/notification"
import { adminRouter } from "@/server/routers/admin"
import { categoryRouter } from "@/server/routers/category"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  product: productRouter,
  order: orderRouter,
  chat: chatRouter,
  review: reviewRouter,
  notification: notificationRouter,
  admin: adminRouter,
  category: categoryRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
