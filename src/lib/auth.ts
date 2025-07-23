import { PrismaAdapter } from "@auth/prisma-adapter"
import type { GetServerSidePropsContext } from "next"
import { getServerSession, type DefaultSession, type NextAuthOptions } from "next-auth"
import type { Adapter } from "next-auth/adapters"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { loginSchema } from "@/validation/auth"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
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

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
        role: token.role as "FARMER" | "SELLER" | "ADMIN",
        phoneNumber: token.phoneNumber as string | undefined,
        isVerified: token.isVerified as boolean,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role
        token.phoneNumber = user.phoneNumber
        token.isVerified = user.isVerified
      }
      return token
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials)

          const user = await db.user.findUnique({
            where: { email },
          })

          if (!user || !user.passwordHash) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            isVerified: user.isVerified,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"]
  res: GetServerSidePropsContext["res"]
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions)
}
