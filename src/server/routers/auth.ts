import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/lib/trpc/server"
import {
  registerSchema,
  verifyPhoneSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/validation/auth"
import { smsGateway } from "@/services/smsGateway"

/**
 * Authentication router handling user registration, login, and verification
 */
export const authRouter = createTRPCRouter({
  /**
   * Register a new user account
   */
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    try {
      const { email, password, name, phoneNumber, role } = input

      // Check if user already exists
      const existingUser = await ctx.db.user.findFirst({
        where: {
          OR: [{ email }, { phoneNumber }],
        },
      })

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email or phone number already exists",
        })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create user and profile in a transaction
      const user = await ctx.db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            phoneNumber,
            role,
          },
        })

        await tx.profile.create({
          data: {
            userId: newUser.id,
            name,
            location: JSON.stringify({}), // Empty location object initially
          },
        })

        return newUser
      })

      // Generate OTP for phone verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      // TODO: Store OTP in database or cache with expiration
      // For now, we'll send it via SMS
      await smsGateway.sendOTP(phoneNumber, otp)

      return {
        success: true,
        message: "Account created successfully. Please verify your phone number.",
        userId: user.id,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create account",
      })
    }
  }),

  /**
   * Verify phone number with OTP
   */
  verifyPhone: publicProcedure.input(verifyPhoneSchema).mutation(async ({ ctx, input }) => {
    try {
      const { phoneNumber, otp } = input

      // TODO: Verify OTP from database or cache
      // For demo purposes, we'll accept any 6-digit OTP
      if (otp.length !== 6) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid OTP",
        })
      }

      // Update user verification status
      const user = await ctx.db.user.update({
        where: { phoneNumber },
        data: { isVerified: true },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      return {
        success: true,
        message: "Phone number verified successfully",
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to verify phone number",
      })
    }
  }),

  /**
   * Request password reset
   */
  forgotPassword: publicProcedure.input(forgotPasswordSchema).mutation(async ({ ctx, input }) => {
    try {
      const { email } = input

      const user = await ctx.db.user.findUnique({
        where: { email },
      })

      if (!user) {
        // Don't reveal if user exists or not
        return {
          success: true,
          message: "If an account with this email exists, you will receive a password reset link.",
        }
      }

      // TODO: Generate and store password reset token
      // TODO: Send password reset email

      return {
        success: true,
        message: "If an account with this email exists, you will receive a password reset link.",
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process password reset request",
      })
    }
  }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure.input(resetPasswordSchema).mutation(async ({ ctx, input }) => {
    try {
      const { token, password } = input

      // TODO: Verify reset token and get user ID
      // For now, we'll throw an error as this needs proper implementation
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Password reset functionality needs to be implemented",
      })

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
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to reset password",
      })
    }
  }),

  /**
   * Change password for authenticated user
   */
  changePassword: protectedProcedure.input(changePasswordSchema).mutation(async ({ ctx, input }) => {
    try {
      const { currentPassword, newPassword } = input
      const userId = ctx.session.user.id

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)

      if (!isCurrentPasswordValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        })
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12)

      // Update password
      await ctx.db.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      })

      return {
        success: true,
        message: "Password changed successfully",
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to change password",
      })
    }
  }),

  /**
   * Get current user session info
   */
  getSession: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session
  }),
})
