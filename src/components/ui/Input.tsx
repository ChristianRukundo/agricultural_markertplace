"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, error, ...props }, ref) => {
  const { contextSafe } = useGSAP()

  const handleFocus = contextSafe((e: React.FocusEvent<HTMLInputElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
    })
  })

  const handleBlur = contextSafe((e: React.FocusEvent<HTMLInputElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    })
  })

  return (
    <div className="relative">
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 smooth-transition",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-destructive animate-slide-down">{error}</p>}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
