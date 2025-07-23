"use client"

import type React from "react"

import { forwardRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(({ isOpen, onClose, children, className }, ref) => {
  const { contextSafe } = useGSAP()

  const animateIn = contextSafe(() => {
    const modal = ref as React.RefObject<HTMLDivElement>
    if (modal.current) {
      gsap.fromTo(
        modal.current.querySelector(".modal-backdrop"),
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
      )
      gsap.fromTo(
        modal.current.querySelector(".modal-content"),
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
      )
    }
  })

  const animateOut = contextSafe(() => {
    const modal = ref as React.RefObject<HTMLDivElement>
    if (modal.current) {
      gsap.to(modal.current.querySelector(".modal-backdrop"), {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      })
      gsap.to(modal.current.querySelector(".modal-content"), {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: "power2.in",
        onComplete: onClose,
      })
    }
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      animateIn()
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, animateIn])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        animateOut()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, animateOut])

  if (!isOpen) return null

  return createPortal(
    <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={animateOut} />
      <div
        className={cn("modal-content glass-card relative max-h-[90vh] max-w-lg w-full mx-4 overflow-auto", className)}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
})
Modal.displayName = "Modal"

export { Modal }
