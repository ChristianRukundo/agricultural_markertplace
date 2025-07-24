"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

interface ImageUploadProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

export function ImageUpload({
  onUpload,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className = "",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [error, setError] = useState<string>("")

  const dropZoneRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { contextSafe } = useGSAP({ scope: dropZoneRef })

  const animateDropZone = contextSafe((scale: number, opacity: number) => {
    gsap.to(dropZoneRef.current, {
      scale,
      opacity,
      duration: 0.2,
      ease: "power2.out",
    })
  })

  const validateFiles = (files: File[]): string | null => {
    if (files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`
    }

    for (const file of files) {
      if (!acceptedTypes.includes(file.type)) {
        return `File type ${file.type} not supported`
      }
      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`
      }
    }

    return null
  }

  const handleFiles = useCallback(
    (files: File[]) => {
      const validationError = validateFiles(files)
      if (validationError) {
        setError(validationError)
        return
      }

      setError("")
      setUploadedFiles(files)
      onUpload(files)
    },
    [maxFiles, maxSize, acceptedTypes, onUpload],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!isDragging) {
        setIsDragging(true)
        animateDropZone(1.02, 1)
      }
    },
    [isDragging, animateDropZone],
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (isDragging) {
        setIsDragging(false)
        animateDropZone(1, 0.8)
      }
    },
    [isDragging, animateDropZone],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      animateDropZone(1, 1)

      const files = Array.from(e.dataTransfer.files)
      handleFiles(files)
    },
    [handleFiles, animateDropZone],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      handleFiles(files)
    },
    [handleFiles],
  )

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onUpload(newFiles)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300
          ${
            isDragging
              ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
              : "border-gray-300 dark:border-gray-600 bg-white/5 dark:bg-black/5 hover:bg-white/10 dark:hover:bg-black/10"
          }
          backdrop-blur-sm
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drop your images here, or <span className="text-primary-600 dark:text-primary-400">browse</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Support for {acceptedTypes.map((type) => type.split("/")[1]).join(", ")} files up to {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">Uploaded Files</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-3"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 overflow-hidden">
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{file.name}</p>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
