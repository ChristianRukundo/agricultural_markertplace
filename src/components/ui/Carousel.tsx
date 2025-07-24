"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Button } from "./Button"

interface CarouselProps {
  children: React.ReactNode[]
  autoPlay?: boolean
  interval?: number
  showDots?: boolean
  showArrows?: boolean
  className?: string
}

export function Carousel({
  children,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className = "",
}: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const { contextSafe } = useGSAP({ scope: containerRef })

  const slideToIndex = contextSafe((index: number) => {
    if (isAnimating || index === currentIndex) return

    setIsAnimating(true)
    const container = containerRef.current
    if (!container) return

    const slides = container.querySelectorAll("[data-slide]")
    const currentSlide = slides[currentIndex]
    const nextSlide = slides[index]

    gsap
      .timeline()
      .to(currentSlide, {
        x: index > currentIndex ? "-100%" : "100%",
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
      })
      .fromTo(
        nextSlide,
        {
          x: index > currentIndex ? "100%" : "-100%",
          opacity: 0,
        },
        {
          x: "0%",
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "-=0.3",
      )
      .call(() => {
        setCurrentIndex(index)
        setIsAnimating(false)
      })
  })

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % children.length
    slideToIndex(nextIndex)
  }

  const prevSlide = () => {
    const prevIndex = currentIndex === 0 ? children.length - 1 : currentIndex - 1
    slideToIndex(prevIndex)
  }

  useEffect(() => {
    if (!autoPlay) return

    const timer = setInterval(nextSlide, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, currentIndex])

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`} ref={containerRef}>
      <div className="relative h-full">
        {children.map((child, index) => (
          <div
            key={index}
            data-slide
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ transform: index === currentIndex ? "translateX(0%)" : "translateX(100%)" }}
          >
            {child}
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
            disabled={isAnimating}
          >
            ←
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
            disabled={isAnimating}
          >
            →
          </Button>
        </>
      )}

      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => slideToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              }`}
              disabled={isAnimating}
            />
          ))}
        </div>
      )}
    </div>
  )
}
