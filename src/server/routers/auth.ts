import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/lib/trpc/server";
import {
  registerSchema,
  verifyPhoneSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/validation/auth";
import { smsGateway } from "@/services/smsGateway";
import { emailService } from "@/services/emailService";
import crypto from "crypto";
import z from "zod" 

/**
 * Authentication router handling user registration, login, and verification
 */
export const authRouter = createTRPCRouter({
  /**
   * Register a new user account
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { email, password, name, phoneNumber, role } = input;

        const existingUser = await ctx.db.user.findFirst({
          where: { OR: [{ email }, { phoneNumber }] },
        });
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email or phone number already exists",
          });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await ctx.db.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: { email, passwordHash, phoneNumber, role },
          });
          await tx.profile.create({
            data: { userId: newUser.id, name, location: JSON.stringify({}) },
          });
          await tx.verificationToken.create({
            data: {
              identifier: email,
              token: verificationToken,
              expires: tokenExpiry,
            },
          });
          return newUser;
        });

        await emailService.sendVerificationEmail(email, verificationToken);

        return {
          success: true,
          message:
            "Account created. Please check your email to verify your account.",
          userId: user.id,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account",
        });
      }
    }),
  /**
   * Verify phone number with OTP
   */
  verifyPhone: publicProcedure
    .input(verifyPhoneSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { phoneNumber, otp } = input;

        // TODO: Verify OTP from database or cache
        // For demo purposes, we'll accept any 6-digit OTP
        if (otp.length !== 6) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid OTP",
          });
        }

        // Update user verification status
        const user = await ctx.db.user.update({
          where: { phoneNumber },
          data: { isVerified: true },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          success: true,
          message: "Phone number verified successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify phone number",
        });
      }
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: { token },
      });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid verification token.",
        });
      }

      if (verificationToken.expires < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification token has expired.",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { email: verificationToken.identifier },
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found for this token.",
        });
      }

      await ctx.db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { isVerified: true, email: user.email }, // email must be provided on update for verification
        });
        await tx.verificationToken.delete({ where: { token } });
      });

      return { success: true, message: "Email verified successfully." };
    }),

  /**
   * Request password reset
   */
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { email } = input;

        const user = await ctx.db.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Don't reveal if user exists or not
          return {
            success: true,
            message:
              "If an account with this email exists, you will receive a password reset link.",
          };
        }

        // TODO: Generate and store password reset token
        // TODO: Send password reset email

        return {
          success: true,
          message:
            "If an account with this email exists, you will receive a password reset link.",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process password reset request",
        });
      }
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { token, password } = input;

        // TODO: Verify reset token and get user ID
        // For now, we'll throw an error as this needs proper implementation
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Password reset functionality needs to be implemented",
        });

        // const passwordHash = await bcrypt.hash(password, 12);
        //
        // await ctx.db.user.update({
        //   where: { id: userId },
        //   data: { passwordHash },
        // });
        //
        // return {
        //   success: true,
        //   message: "Password reset successfully",
        // };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset password",
        });
      }
    }),

  /**
   * Change password for authenticated user
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { currentPassword, newPassword } = input;
        const userId = ctx.session.user.id as string;

        const user = await ctx.db.user.findUnique({
          where: { id: userId },
        });

        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          user.passwordHash
        );

        if (!isCurrentPasswordValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Current password is incorrect",
          });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // Update password
        await ctx.db.user.update({
          where: { id: userId },
          data: { passwordHash: newPasswordHash },
        });

        return {
          success: true,
          message: "Password changed successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to change password",
        });
      }
    }),

  /**
   * Get current user session info
   */
  getSession: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
});
