"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function Avatar({ src, alt = "", fallback, size = "md", className = "" }: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-xl",
  }

  const baseClasses =
    "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-medium overflow-hidden"

  if (src && !imageError) {
    return (
      <div className={cn(baseClasses, sizeClasses[size], className)}>
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  return (
    <div className={cn(baseClasses, sizeClasses[size], className)}>
      {fallback || alt.charAt(0).toUpperCase() || "?"}
    </div>
  )
}
