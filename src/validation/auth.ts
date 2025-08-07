import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  phoneNumberSchema,
} from "@/lib/utils/validation";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phoneNumber: phoneNumberSchema.optional(), // Make phone number optional during initial registration
    role: z.enum(["FARMER", "SELLER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerFormSchema = registerSchema;

export const requestEmailVerificationSchema = z.object({
  email: emailSchema,
});

export const requestPhoneVerificationSchema = z.object({
  phoneNumber: phoneNumberSchema,
});

export const verifyPhoneSchema = z.object({
  phoneNumber: phoneNumberSchema,
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RequestEmailVerificationInput = z.infer<
  typeof requestEmailVerificationSchema
>; // New export
export type RequestPhoneVerificationInput = z.infer<
  typeof requestPhoneVerificationSchema
>; // New export
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
