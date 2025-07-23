import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "FARMER" | "SELLER" | "ADMIN"
      phoneNumber?: string
      isVerified: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "FARMER" | "SELLER" | "ADMIN"
    phoneNumber?: string
    isVerified: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "FARMER" | "SELLER" | "ADMIN"
    phoneNumber?: string
    isVerified: boolean
  }
}
