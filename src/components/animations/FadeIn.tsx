"use client"

import type React from "react"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 0.6, y = 30, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          y: y,
        },
        {
          opacity: 1,
          y: 0,
          duration: duration,
          delay: delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }
  }, [delay, duration, y])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
