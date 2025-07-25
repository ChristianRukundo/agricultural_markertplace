import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import { newsletterSchema } from "@/validation/newsletter";
import { emailService } from "@/services/emailService";

/**
 * Newsletter management router
 * Handles newsletter subscriptions.
 */
export const newsletterRouter = createTRPCRouter({
  /**
   * Subscribe to the newsletter.
   * Public procedure: anyone can subscribe.
   *
   * @param input - { email }
   * @returns Success message
   */
  subscribe: publicProcedure
    .input(newsletterSchema)
    .mutation(async ({ input }) => {
      try {
        // Simulate saving the email to a database or mailing list provider
        // For now, just log it
        console.log("New newsletter subscription:", input.email);

        // Optionally, send a confirmation email (mocked)
        await emailService.sendEmail({
          to: input.email,
          subject: "Welcome to AgriConnect Newsletter!",
          html: `<p>Thank you for subscribing to AgriConnect updates. You'll now receive the latest news and offers.</p>`,
        });

        return {
          success: true,
          message: "You have been subscribed to the newsletter!",
        };
      } catch (error) {
        console.error("Newsletter subscription error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to subscribe. Please try again later.",
        });
      }
    }),
});
