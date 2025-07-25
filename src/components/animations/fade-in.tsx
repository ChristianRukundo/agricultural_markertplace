"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useGSAP } from "@/components/providers/gsap-provider"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 0.6, y = 30, className = "" }: FadeInProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const gsap = useGSAP()

  useEffect(() => {
    if (!elementRef.current) return

    gsap.fromTo(
      elementRef.current,
      {
        opacity: 0,
        y: y,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: "power2.out",
      },
    )
  }, [gsap, delay, duration, y])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}
