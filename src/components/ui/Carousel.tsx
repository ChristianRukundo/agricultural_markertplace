"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useGSAP } from "@/components/providers/gsap-provider"

interface CarouselProps {
  images: string[]
  alt: string
  className?: string
}

export function Carousel({ images, alt, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const gsap = useGSAP()

  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [images.length, isAutoPlaying])

  useEffect(() => {
    if (!carouselRef.current) return

    gsap.fromTo(
      carouselRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
    )
  }, [currentIndex, gsap])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  if (images.length === 0) {
    return (
      <div className={cn("aspect-video bg-muted rounded-lg flex items-center justify-center", className)}>
        <span className="text-muted-foreground">No images available</span>
      </div>
    )
  }

  return (
    <div className={cn("relative group", className)}>
      {/* Main Image */}
      <div ref={carouselRef} className="aspect-video bg-muted rounded-lg overflow-hidden">
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-white" : "bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
