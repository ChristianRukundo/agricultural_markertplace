import { TRPCError } from "@trpc/server"

interface FileValidationOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
  maxFiles?: number
}

interface FileInfo {
  name: string
  size: number
  type: string
  extension: string
}

/**
 * File validation utilities
 */
export class FileValidator {
  private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  private static readonly DEFAULT_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]

  /**
   * Validate file based on options
   */
  static validateFile(file: FileInfo, options: FileValidationOptions = {}): void {
    const {
      maxSize = this.DEFAULT_MAX_SIZE,
      allowedTypes = this.DEFAULT_ALLOWED_TYPES,
      allowedExtensions = this.DEFAULT_ALLOWED_EXTENSIONS,
    } = options

    // Check file size
    if (file.size > maxSize) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`,
      })
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      })
    }

    // Check file extension
    if (!allowedExtensions.includes(file.extension.toLowerCase())) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `File extension ${file.extension} is not allowed. Allowed extensions: ${allowedExtensions.join(", ")}`,
      })
    }

    // Check for potentially dangerous files
    this.checkForMaliciousFile(file)
  }

  /**
   * Validate multiple files
   */
  static validateFiles(files: FileInfo[], options: FileValidationOptions = {}): void {
    const { maxFiles = 10 } = options

    if (files.length > maxFiles) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Too many files. Maximum allowed: ${maxFiles}`,
      })
    }

    files.forEach((file, index) => {
      try {
        this.validateFile(file, options)
      } catch (error) {
        if (error instanceof TRPCError) {
          throw new TRPCError({
            code: error.code,
            message: `File ${index + 1}: ${error.message}`,
          })
        }
        throw error
      }
    })
  }

  /**
   * Check for potentially malicious files
   */
  private static checkForMaliciousFile(file: FileInfo): void {
    const dangerousExtensions = [
      ".exe",
      ".bat",
      ".cmd",
      ".com",
      ".pif",
      ".scr",
      ".vbs",
      ".js",
      ".jar",
      ".php",
      ".asp",
      ".aspx",
      ".jsp",
    ]

    const extension = file.extension.toLowerCase()

    if (dangerousExtensions.includes(extension)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "File type not allowed for security reasons",
      })
    }

    // Check for double extensions (e.g., image.jpg.exe)
    const nameParts = file.name.split(".")
    if (nameParts.length > 2) {
      const secondExtension = `.${nameParts[nameParts.length - 2]}`
      if (dangerousExtensions.includes(secondExtension.toLowerCase())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File with suspicious double extension not allowed",
        })
      }
    }
  }

  /**
   * Format file size for human reading
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf("."))
  }

  /**
   * Generate safe filename
   */
  static generateSafeFilename(originalName: string, userId?: string): string {
    const extension = this.getFileExtension(originalName)
    const baseName = originalName.replace(extension, "").replace(/[^a-zA-Z0-9]/g, "_")
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)

    return `${baseName}_${timestamp}_${random}${userId ? `_${userId}` : ""}${extension}`
  }

  /**
   * Validate image dimensions (requires additional metadata)
   */
  static validateImageDimensions(
    width: number,
    height: number,
    options: {
      minWidth?: number
      minHeight?: number
      maxWidth?: number
      maxHeight?: number
      aspectRatio?: number
      aspectRatioTolerance?: number
    } = {},
  ): void {
    const { minWidth, minHeight, maxWidth, maxHeight, aspectRatio, aspectRatioTolerance = 0.1 } = options

    if (minWidth && width < minWidth) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Image width must be at least ${minWidth}px`,
      })
    }

    if (minHeight && height < minHeight) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Image height must be at least ${minHeight}px`,
      })
    }

    if (maxWidth && width > maxWidth) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Image width must not exceed ${maxWidth}px`,
      })
    }

    if (maxHeight && height > maxHeight) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Image height must not exceed ${maxHeight}px`,
      })
    }

    if (aspectRatio) {
      const currentRatio = width / height
      const difference = Math.abs(currentRatio - aspectRatio)

      if (difference > aspectRatioTolerance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Image aspect ratio must be approximately ${aspectRatio}:1`,
        })
      }
    }
  }
}

// Pre-configured validators for different use cases
export const fileValidators = {
  // Profile pictures
  profilePicture: (file: FileInfo) =>
    FileValidator.validateFile(file, {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    }),

  // Product images
  productImages: (files: FileInfo[]) =>
    FileValidator.validateFiles(files, {
      maxSize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 5,
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    }),

  // Category images
  categoryImage: (file: FileInfo) =>
    FileValidator.validateFile(file, {
      maxSize: 1 * 1024 * 1024, // 1MB
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    }),

  // Documents (for business registration, etc.)
  documents: (files: FileInfo[]) =>
    FileValidator.validateFiles(files, {
      maxSize: 10 * 1024 * 1024, // 10MB per file
      maxFiles: 3,
      allowedTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
      allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png"],
    }),
}
