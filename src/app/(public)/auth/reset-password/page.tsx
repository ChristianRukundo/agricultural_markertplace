"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { useGSAP } from "@/components/providers/gsap-provider";
import { useEffect, useRef, useState } from "react";
import { resetPasswordSchema } from "@/validation/auth";
import { api } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const containerRef = useRef<HTMLDivElement>(null);
  const gsap = useGSAP();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
    },
  });

  const resetPasswordMutation = api.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Password Reset Successful",
        description: data.message,
      });
      setResetSuccess(true);
      setErrorMessage(null);
    },
    onError: (error) => {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
      setErrorMessage(error.message);
      setResetSuccess(false);
    },
  });

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      ".auth-panel-content",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.1 }
    );
  }, [gsap]);

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage(
        "No reset token found. Please use the link from your email."
      );
      return;
    }
    resetPasswordMutation.mutate(data);
  };

  if (!token) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Invalid Link</h2>
          <p className="text-muted-foreground mb-6">
            No password reset token found in the URL. Please ensure you&apos;ve
            clicked the full link from your email.
          </p>
          <Link
            href="/auth/forgot-password"
            className="text-primary hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div
        ref={containerRef}
        className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl space-y-6"
      >
        <div className="text-center">
          <h1 className="auth-panel-content text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reset Your Password
          </h1>
          <p className="auth-panel-content text-gray-500 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        {resetSuccess ? (
          <div className="auth-panel-content text-center text-green-600">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Password Reset!</h2>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errorMessage && (
              <div className="auth-panel-content flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            <input type="hidden" {...register("token")} value={token || ""} />

            <div className="auth-panel-content">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-12 pr-12 py-3 bg-gray-100 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all",
                    errors.password
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-gray-200 dark:border-gray-700 focus:ring-primary/50 focus:border-primary"
                  )}
                  disabled={isSubmitting || resetPasswordMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="auth-panel-content">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-12 pr-12 py-3 bg-gray-100 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all",
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-gray-200 dark:border-gray-700 focus:ring-primary/50 focus:border-primary"
                  )}
                  disabled={isSubmitting || resetPasswordMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || resetPasswordMutation.isPending}
              className="auth-panel-content w-full py-3 px-4 text-white font-semibold rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting || resetPasswordMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
