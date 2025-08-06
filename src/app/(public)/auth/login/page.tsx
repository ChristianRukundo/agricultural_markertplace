"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useGSAP } from "@/components/providers/gsap-provider";
import { loginSchema } from "@/validation/auth";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/Logo";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gsap = useGSAP();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      ".auth-illustration-panel",
      { opacity: 0, x: -100 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
    )
      .fromTo(
        ".auth-form-panel",
        { opacity: 0, x: 100 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(
        ".form-element",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.3"
      );
  }, [gsap]);

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (result?.error) {
      setFormError("Invalid email or password. Please try again.");
    } else if (result?.ok) {
      router.push("/dashboard");
    } else {
      setFormError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <main
      ref={containerRef}
      className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-900"
    >
      {/* Illustration Panel */}
      <div className="auth-illustration-panel hidden lg:flex w-1/2 items-center justify-center p-12 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 relative overflow-hidden">
        <div className="text-center z-10">
          <Link
            href="/"
            className="flex items-center justify-center space-x-3 mb-8"
          >
            <Logo width={100} height={100} showText={false} />

            <span className="text-3xl font-bold text-gray-800 dark:text-white">
              AgriConnect
            </span>
          </Link>
          <p className="text-xl max-w-sm mx-auto text-gray-600 dark:text-gray-300">
            Welcome back to the future of agriculture. Your next opportunity
            awaits.
          </p>
        </div>
        {/* Decorative Shapes */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/10 rounded-full opacity-50 animate-float" />
        <div
          className="absolute -bottom-24 -right-10 w-72 h-72 bg-blue-500/10 rounded-full opacity-50 animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-left mb-10">
            <h1 className="form-element text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In
            </h1>
            <p className="form-element text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Form Error */}
            {formError && (
              <div className="form-element flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">{formError}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="form-element">
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
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="form-element">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
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
                  disabled={isSubmitting}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="form-element w-full py-3 px-4 text-white font-semibold rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
