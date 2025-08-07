"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useGSAP } from "@/components/providers/gsap-provider";
import { useEffect, useRef } from "react";
import { forgotPasswordSchema } from "@/validation/auth";
import { api } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const gsap = useGSAP();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = api.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Password Reset Link Sent",
        description: data.message,
      });
      reset();
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
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

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div
        ref={containerRef}
        className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl space-y-6"
      >
        <div className="text-center">
          <h1 className="auth-panel-content text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forgot Your Password?
          </h1>
          <p className="auth-panel-content text-gray-500 dark:text-gray-400">
            Enter your email address below and we&apos;ll send you a link to
            reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="auth-panel-content">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your.email@example.com"
                className={cn(
                  "w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all",
                  errors.email
                    ? "border-red-500 focus:ring-red-500/50"
                    : "border-gray-200 dark:border-gray-700 focus:ring-primary/50 focus:border-primary"
                )}
                disabled={isSubmitting || forgotPasswordMutation.isPending}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || forgotPasswordMutation.isPending}
            className="auth-panel-content w-full py-3 px-4 text-white font-semibold rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting || forgotPasswordMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <span>Sending Link...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" /> Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="auth-panel-content text-center mt-6">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:underline flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
