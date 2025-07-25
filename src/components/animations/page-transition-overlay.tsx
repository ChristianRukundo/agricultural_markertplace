"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useGSAP } from "@/components/providers/gsap-provider"

export function PageTransitionOverlay() {
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const gsap = useGSAP()

  useEffect(() => {
    if (!overlayRef.current) return

    const overlay = overlayRef.current

    // Animate overlay in
    gsap.set(overlay, { scaleX: 0, transformOrigin: "left center" })
    gsap.to(overlay, {
      scaleX: 1,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        // Animate overlay out
        gsap.to(overlay, {
          scaleX: 0,
          transformOrigin: "right center",
          duration: 0.4,
          ease: "power2.inOut",
          delay: 0.1,
        })
      },
    })
  }, [pathname, gsap])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-gradient-primary pointer-events-none"
      style={{ scaleX: 0 }}
    />
  )
}
