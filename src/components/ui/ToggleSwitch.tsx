"use client"

import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

interface ToggleSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ToggleSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  size = "md",
  className,
}: ToggleSwitchProps) {
  const { contextSafe } = useGSAP()

  const sizeClasses = {
    sm: "h-5 w-9",
    md: "h-6 w-11",
    lg: "h-7 w-13",
  }

  const thumbSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleToggle = contextSafe(() => {
    if (!disabled) {
      onCheckedChange(!checked)

      // Animate the switch
      const thumb = document.querySelector(".toggle-thumb")
      if (thumb) {
        gsap.to(thumb, {
          x: checked ? 0 : 20,
          duration: 0.2,
          ease: "power2.out",
        })
      }
    }
  })

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
        sizeClasses[size],
        className,
      )}
      onClick={handleToggle}
    >
      <span
        className={cn(
          "toggle-thumb pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
          thumbSizeClasses[size],
        )}
      />
    </button>
  )
}
