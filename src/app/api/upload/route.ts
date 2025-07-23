import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generatePresignedUrl } from "@/services/cloudinary"

/**
 * API endpoint for generating presigned URLs for direct client-to-Cloudinary uploads
 * This approach is more secure as it doesn't expose API credentials to the client
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { fileType, folder } = body

    if (!fileType || !folder) {
      return NextResponse.json({ error: "File type and folder are required" }, { status: 400 })
    }

    // Validate folder permissions based on user role
    const allowedFolders = {
      FARMER: ["products", "profile"],
      SELLER: ["profile"],
      ADMIN: ["products", "profile", "categories"],
    }

    if (!allowedFolders[session.user.role]?.includes(folder)) {
      return NextResponse.json({ error: "Insufficient permissions for this folder" }, { status: 403 })
    }

    const uploadData = await generatePresignedUrl({
      folder,
      userId: session.user.id,
      fileType,
    })

    return NextResponse.json(uploadData)
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
