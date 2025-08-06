"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  UserCheck,
  ShoppingBag,
} from "lucide-react";
import { useGSAP } from "@/components/providers/gsap-provider";
import { registerFormSchema } from "@/validation/auth";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/common/Logo";

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gsap = useGSAP();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      role: "SELLER",
    },
  });

  const selectedRole = watch("role");

  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });

      router.push("/auth/login");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      ".auth-illustration-panel",
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
    )
      .fromTo(
        ".auth-form-panel",
        { opacity: 0, x: -100 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(
        ".form-element",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.3"
      );
  }, [gsap]);

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <main
      ref={containerRef}
      className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-900"
    >
      {/* Illustration Panel */}
      <div className="auth-illustration-panel hidden lg:flex w-1/2 items-center justify-center p-12 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 relative overflow-hidden">
        <div className="text-center z-10">
          <button
            className="flex items-center justify-center space-x-3 mb-8"
          >
            <Logo width={100} height={100} showText={false} />  
            <span className="text-3xl font-bold text-gray-800 dark:text-white">
              AgriConnect
            </span>
          </button>
          <p className="text-xl max-w-sm mx-auto text-gray-600 dark:text-gray-300">
            Join a thriving community connecting farmers and sellers across
            Rwanda.
          </p>
        </div>
        {/* Decorative Shapes */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full opacity-50 animate-float" />
        <div
          className="absolute -bottom-24 -left-10 w-72 h-72 bg-blue-500/10 rounded-full opacity-50 animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-left mb-10">
            <h1 className="form-element text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="form-element text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div className="form-element">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("role", "FARMER")}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200",
                    selectedRole === "FARMER"
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  )}
                >
                  <UserCheck className="w-6 h-6 mb-1 text-primary" />
                  <span className="text-sm font-medium">Farmer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("role", "SELLER")}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200",
                    selectedRole === "SELLER"
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  )}
                >
                  <ShoppingBag className="w-6 h-6 mb-1 text-primary" />
                  <span className="text-sm font-medium">Seller</span>
                </button>
              </div>
            </div>

            {/* Input fields */}
            {[
              {
                id: "name",
                type: "text",
                placeholder: "John Doe",
                icon: User,
                label: "Full Name",
              },
              {
                id: "email",
                type: "email",
                placeholder: "your.email@example.com",
                icon: Mail,
                label: "Email Address",
              },
              {
                id: "phoneNumber",
                type: "tel",
                placeholder: "+250 788 123 456",
                icon: Phone,
                label: "Phone Number",
              },
              {
                id: "password",
                type: showPassword ? "text" : "password",
                placeholder: "••••••••",
                icon: Lock,
                label: "Password",
                toggle: () => setShowPassword(!showPassword),
                show: showPassword,
              },
              {
                id: "confirmPassword",
                type: showConfirmPassword ? "text" : "password",
                placeholder: "••••••••",
                icon: Lock,
                label: "Confirm Password",
                toggle: () => setShowConfirmPassword(!showConfirmPassword),
                show: showConfirmPassword,
              },
            ].map((field) => (
              <div className="form-element" key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id={field.id}
                    type={field.type}
                    {...register(field.id as keyof RegisterFormData)}
                    placeholder={field.placeholder}
                    className={cn(
                      "w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all",
                      errors[field.id as keyof RegisterFormData]
                        ? "border-red-500 focus:ring-red-500/50"
                        : "border-gray-200 dark:border-gray-700 focus:ring-primary/50 focus:border-primary",
                      field.toggle && "pr-12"
                    )}
                    disabled={isSubmitting || registerMutation.isPending}
                  />
                  {field.toggle && (
                    <button
                      type="button"
                      onClick={field.toggle}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {field.show ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
                {errors[field.id as keyof RegisterFormData] && (
                  <p className="mt-2 text-xs text-red-500">
                    {errors[field.id as keyof RegisterFormData]?.message}
                  </p>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className="form-element w-full py-3 px-4 text-white font-semibold rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting || registerMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
