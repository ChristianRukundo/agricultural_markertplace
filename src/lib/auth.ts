import { PrismaAdapter } from "@auth/prisma-adapter";
import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/validation/auth";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "FARMER" | "SELLER" | "ADMIN";
      phoneNumber?: string;
      isVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "FARMER" | "SELLER" | "ADMIN";
    phoneNumber?: string;
    isVerified: boolean;
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
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
        token.isVerified = user.isVerified;
      }
      return token;
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
      async authorize(credentials, req) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          const user = await db.user.findUnique({
            where: { email },
            include: {
              profile: {
                select: {
                  name: true,
                },
              },
            },
          });

          if (!user || !user.passwordHash) {
            // Throw a specific error message that can be caught on the client
            throw new Error("Invalid credentials.");
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            // Throw a specific error message
            throw new Error("Invalid credentials.");
          }

          // **NEW: Prevent login if account is not verified**
          if (!user.isVerified) {
            // This error message will be propagated to `signIn` result's `error` field
            throw new Error("AccountNotVerified"); // A custom code for the client to interpret
          }

          return {
            id: user.id,
            email: user.email,
            name: user.profile?.name,
            role: user.role,
            phoneNumber: user.phoneNumber ?? undefined,
            isVerified: user.isVerified,
          };
        } catch (error) {
          // Re-throw the error so NextAuth captures its message
          if (error instanceof Error) {
            throw error;
          }
          // Catch any unexpected errors and provide a generic message
          throw new Error("An unexpected error occurred during login.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
