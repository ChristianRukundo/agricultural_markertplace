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
  requestPhoneVerificationSchema,
  requestEmailVerificationSchema,
} from "@/validation/auth";
import { smsGateway } from "@/services/smsGateway";
import { emailService } from "@/services/emailService";
import crypto from "crypto";
import z from "zod";
import { addHours, isAfter, isBefore } from "date-fns";

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
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = addHours(new Date(), 24);

        const user = await ctx.db.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: { email, passwordHash, phoneNumber, role, isVerified: false },
          });
          await tx.profile.create({
            data: { userId: newUser.id, name, location: JSON.stringify({}) },
          });
          await tx.verificationToken.create({
            data: {
              identifier: email,
              token: emailVerificationToken,
              expires: tokenExpiry,
              type: "EMAIL_VERIFICATION",
            },
          });
          return newUser;
        });

        await emailService.sendVerificationEmail(email, emailVerificationToken);

        return {
          success: true,
          message:
            "Account created successfully! Please check your email to verify your account.",
          userId: user.id,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error during user registration:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account. Please try again.",
        });
      }
    }),

  /**
   * Verify email address with token from email link
   */
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
      const verificationToken = await ctx.db.verificationToken.findUnique({
        where: { token, type: "EMAIL_VERIFICATION" },
      });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid or expired verification token.",
        });
      }

      if (isBefore(verificationToken.expires, new Date())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification token has expired. Please request a new one.",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { email: verificationToken.identifier },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found for this verification token.",
        });
      }

      if (user.email !== verificationToken.identifier) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token does not match user account.",
        });
      }
      await ctx.db.$transaction(
        async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: { isVerified: true },
          });
          await tx.verificationToken.delete({
            where: { token: verificationToken.token },
          });
        },
        {
          maxWait: 20_000,
          timeout: 60_000,
        }
      );

      return {
        success: true,
        message: "Email verified successfully. You can now log in.",
      };
    }),

  /**
   * Request a new email verification link if the account is not verified.
   */
  requestEmailVerification: publicProcedure
    .input(requestEmailVerificationSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      const user = await ctx.db.user.findUnique({ where: { email } });

      if (!user) {
        return {
          success: true,
          message:
            "If an account with this email exists and is not verified, a new verification link has been sent.",
        };
      }

      if (user.isVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This account is already verified.",
        });
      }

      await ctx.db.verificationToken.deleteMany({
        where: {
          identifier: email,
          type: "EMAIL_VERIFICATION",
          expires: { gte: new Date() },
        },
      });

      const newVerificationToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = addHours(new Date(), 24);

      await ctx.db.verificationToken.create({
        data: {
          identifier: email,
          token: newVerificationToken,
          expires: tokenExpiry,
          type: "EMAIL_VERIFICATION",
        },
      });

      await emailService.sendVerificationEmail(email, newVerificationToken);

      return {
        success: true,
        message: "A new verification link has been sent to your email address.",
      };
    }),

  /**
   * Request phone number verification (sends an OTP via SMS).
   */
  requestPhoneVerification: publicProcedure
    .input(requestPhoneVerificationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { phoneNumber } = input;

        const user = await ctx.db.user.findUnique({
          where: { phoneNumber },
          select: { id: true, isVerified: true },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User with this phone number not found.",
          });
        }

        if (user.isVerified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Your account is already verified.",
          });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = addHours(new Date(), 0.5);

        await ctx.db.otp.deleteMany({
          where: { userId: user.id, type: "PHONE_VERIFICATION" },
        });

        await ctx.db.otp.create({
          data: {
            userId: user.id,
            code: otpCode,
            type: "PHONE_VERIFICATION",
            expiresAt: otpExpiry,
          },
        });

        await smsGateway.sendOTP(phoneNumber, otpCode);

        return {
          success: true,
          message: "Verification code sent to your phone number.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error requesting phone verification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send verification code. Please try again.",
        });
      }
    }),

  /**
   * Verify phone number with received OTP.
   */
  verifyPhone: publicProcedure
    .input(verifyPhoneSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { phoneNumber, otp } = input;

        const user = await ctx.db.user.findUnique({
          where: { phoneNumber },
          select: { id: true, isVerified: true },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found for this phone number.",
          });
        }

        if (user.isVerified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Account is already verified.",
          });
        }

        const storedOtp = await ctx.db.otp.findFirst({
          where: {
            userId: user.id,
            type: "PHONE_VERIFICATION",
            code: otp,
            expiresAt: { gte: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!storedOtp) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification code.",
          });
        }

        await ctx.db.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: { isVerified: true },
          });
          await tx.otp.delete({ where: { id: storedOtp.id } });
        });

        return {
          success: true,
          message: "Phone number verified successfully.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error verifying phone number:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify phone number. Please try again.",
        });
      }
    }),

  /**
   * Request password reset link (via email).
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
          return {
            success: true,
            message:
              "If an account with this email exists, a password reset link has been sent to it.",
          };
        }

        await ctx.db.verificationToken.deleteMany({
          where: {
            identifier: email,
            type: "PASSWORD_RESET",
            expires: { gte: new Date() },
          },
        });

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = addHours(new Date(), 1);

        await ctx.db.verificationToken.create({
          data: {
            identifier: email,
            token: resetToken,
            expires: tokenExpiry,
            type: "PASSWORD_RESET",
          },
        });

        await emailService.sendPasswordResetEmail(email, resetToken);

        return {
          success: true,
          message: "A password reset link has been sent to your email address.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error during forgot password request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to process password reset request. Please try again.",
        });
      }
    }),

  /**
   * Reset password using a token received from the `forgotPassword` email link.
   */
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { token, password } = input;

        const verificationToken = await ctx.db.verificationToken.findUnique({
          where: { token, type: "PASSWORD_RESET" },
        });

        if (!verificationToken) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invalid or expired password reset token.",
          });
        }

        if (isBefore(verificationToken.expires, new Date())) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Password reset token has expired. Please request a new one.",
          });
        }

        const user = await ctx.db.user.findUnique({
          where: { email: verificationToken.identifier },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found for this token.",
          });
        }

        const newPasswordHash = await bcrypt.hash(password, 12);

        await ctx.db.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash },
          });
          await tx.verificationToken.delete({
            where: { token: verificationToken.token },
          });
        });

        return {
          success: true,
          message:
            "Password reset successfully. You can now log in with your new password.",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error during password reset:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset password. Please try again.",
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
        // Fix: Destructure currentPassword and newPassword from input here
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

        const newPasswordHash = await bcrypt.hash(newPassword, 12);

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
