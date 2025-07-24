"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"

interface ImageUploadProps {
  value?: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  maxSize?: number // in MB
  accept?: string
  className?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  maxSize = 5,
  accept = "image/*",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: dropZoneRef })

  const animateDropZone = contextSafe((isDragOver: boolean) => {
    gsap.to(dropZoneRef.current, {
      scale: isDragOver ? 1.02 : 1,
      borderColor: isDragOver ? "#3B82F6" : "#D1D5DB",
      backgroundColor: isDragOver ? "rgba(59, 130, 246, 0.05)" : "transparent",
      duration: 0.2,
      ease: "power2.out",
    })
  })

  const handleFileSelect = async (files: FileList) => {
    if (value.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB`)
        continue
      }

      try {
        // Create FormData for upload
        const formData = new FormData()
        formData.append("file", file)

        // Upload to your API endpoint
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const { url } = await response.json()
          newImages.push(url)
        } else {
          throw new Error("Upload failed")
        }
      } catch (error) {
        console.error("Upload error:", error)
        alert(`Failed to upload ${file.name}`)
      }
    }

    onChange([...value, ...newImages])
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    animateDropZone(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!dragOver) {
      setDragOver(true)
      animateDropZone(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    animateDropZone(false)
  }

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-primary-400"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">Uploading images...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📸</div>
            <p className="text-gray-600 dark:text-gray-400">Drop images here or click to select</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Maximum {maxImages} images, {maxSize}MB each
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image || "/placeholder.svg"}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 h-auto min-h-0"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
