"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useGSAP } from "@/components/providers/gsap-provider"

interface SlideInOnScrollProps {
  children: React.ReactNode
  direction?: "left" | "right" | "up" | "down"
  distance?: number
  className?: string
  delay?: number // in seconds
}

export function SlideInOnScroll({ children, direction = "up", distance = 50, className = "", delay = 0 }: SlideInOnScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const gsap = useGSAP()

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current
    const getInitialTransform = () => {
      switch (direction) {
        case "left":
          return { x: -distance, y: 0 }
        case "right":
          return { x: distance, y: 0 }
        case "up":
          return { x: 0, y: distance }
        case "down":
          return { x: 0, y: -distance }
        default:
          return { x: 0, y: distance }
      }
    }

    const initial = getInitialTransform()

    gsap.fromTo(
      element,
      {
        opacity: 0,
        ...initial,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        delay: delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    )
  }, [gsap, direction, distance, delay])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}
