"use client"

import type React from "react"

import { createContext, useContext, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const GSAPContext = createContext<typeof gsap | null>(null)

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  const gsapRef = useRef(gsap)

  useEffect(() => {
    // Global GSAP configuration
    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return <GSAPContext.Provider value={gsapRef.current}>{children}</GSAPContext.Provider>
}

export const useGSAP = () => {
  const context = useContext(GSAPContext)
  if (!context) {
    throw new Error("useGSAP must be used within GSAPProvider")
  }
  return context
}
