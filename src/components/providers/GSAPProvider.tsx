"use client"

import type React from "react"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect } from "react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Global GSAP configuration
    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    })

    // Set default ease
    gsap.defaults({
      ease: "power2.out",
      duration: 0.6,
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return <>{children}</>
}
