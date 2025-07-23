import { v2 as cloudinary } from "cloudinary"
import { env } from "@/env.js"

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

interface GeneratePresignedUrlParams {
  folder: string
  userId: string
  fileType: string
}

/**
 * Generates a presigned URL for direct client-to-Cloudinary uploads
 * This is more secure than exposing API credentials to the client
 */
export async function generatePresignedUrl({ folder, userId, fileType }: GeneratePresignedUrlParams) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000)
    const publicId = `${folder}/${userId}/${timestamp}`

    const params = {
      timestamp,
      public_id: publicId,
      folder,
      resource_type: fileType.startsWith("image/") ? "image" : "auto",
    }

    const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET)

    return {
      url: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/upload`,
      params: {
        ...params,
        signature,
        api_key: env.CLOUDINARY_API_KEY,
      },
    }
  } catch (error) {
    console.error("Error generating presigned URL:", error)
    throw new Error("Failed to generate upload URL")
  }
}

/**
 * Deletes an image from Cloudinary
 */
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Error deleting image:", error)
    throw new Error("Failed to delete image")
  }
}

/**
 * Gets optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string
    format?: string
  } = {},
) {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    quality: options.quality || "auto",
    format: options.format || "auto",
    crop: "fill",
  })
}
