"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StarRating({ rating, onRatingChange, readonly = false, size = "md", className }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const { contextSafe } = useGSAP()

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  const handleStarHover = contextSafe((e: React.MouseEvent, starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating)
      gsap.to(e.currentTarget, {
        scale: 1.2,
        duration: 0.2,
        ease: "power2.out",
      })
    }
  })

  const handleStarLeave = contextSafe((e: React.MouseEvent) => {
    if (!readonly) {
      setHoverRating(0)
      gsap.to(e.currentTarget, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      })
    }
  })

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating)
        return (
          <button
            key={star}
            type="button"
            className={cn(
              "transition-colors duration-200",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default",
            )}
            onClick={() => handleStarClick(star)}
            onMouseEnter={(e) => handleStarHover(e, star)}
            onMouseLeave={handleStarLeave}
            disabled={readonly}
          >
            <svg
              className={cn(
                sizeClasses[size],
                isFilled ? "text-yellow-400 fill-current" : "text-gray-300 fill-current",
              )}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
