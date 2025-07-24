"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

export function PageTransitionOverlay() {
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const { contextSafe } = useGSAP()

  const animatePageTransition = contextSafe(() => {
    if (overlayRef.current) {
      // Animate overlay in
      gsap.fromTo(
        overlayRef.current,
        {
          scaleY: 0,
          transformOrigin: "top",
        },
        {
          scaleY: 1,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            // Animate overlay out
            gsap.to(overlayRef.current, {
              scaleY: 0,
              transformOrigin: "bottom",
              duration: 0.4,
              delay: 0.1,
              ease: "power2.inOut",
            })
          },
        },
      )
    }
  })

  useEffect(() => {
    animatePageTransition()
  }, [pathname, animatePageTransition])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-gradient-to-br from-primary-500 to-primary-700 pointer-events-none"
      style={{ transform: "scaleY(0)" }}
    />
  )
}
