"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Badge({ children, variant = "default", size = "md", className = "" }: BadgeProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200"

  const variantClasses = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  }

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  }

  return <span className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}>{children}</span>
}
