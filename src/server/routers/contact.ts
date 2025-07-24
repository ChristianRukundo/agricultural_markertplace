import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "@/lib/trpc/server";
import { contactSchema } from "@/validation/contact";

/**
 * Contact management router
 * This router handles operations related to the contact form,
 * such as sending messages.
 */
export const contactRouter = createTRPCRouter({
  /**
   * Send a contact message.
   * This is a public procedure, meaning it can be called by unauthenticated users.
   *
   * @param input - The validated contact form data (name, email, subject, message).
   * @returns A success message upon successful submission.
   * @throws TRPCError if the message sending fails (e.g., internal server error).
   */

  send: publicProcedure
    .input(contactSchema) // Validate input against the contactSchema
    .mutation(async ({ input }) => {
      try {
       

        console.log("Received contact message:");
        console.log(`Name: ${input.name}`);
        console.log(`Email: ${input.email}`);
        console.log(`Subject: ${input.subject}`);
        console.log(`Message: ${input.message}`);

        // Simulate a delay for sending the email (e.g., network latency)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Return a success response
        return {
          success: true,
          message: "Your message has been sent successfully!",
        };
      } catch (error) {
        // Log the actual error for debugging purposes on the server
        console.error("Error sending contact message:", error);

        // Throw a tRPC error to be caught by the client
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send your message. Please try again later.",
        });
      }
    }),
});
