"use client"

import type React from "react"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

interface SlideInOnScrollProps {
  children: React.ReactNode
  direction?: "left" | "right" | "up" | "down"
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export function SlideInOnScroll({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  distance = 50,
  className,
}: SlideInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (ref.current) {
      const getInitialPosition = () => {
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

      const initial = getInitialPosition()

      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          x: initial.x,
          y: initial.y,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: duration,
          delay: delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }
  }, [direction, delay, duration, distance])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
