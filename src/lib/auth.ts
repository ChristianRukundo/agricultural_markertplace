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
      async authorize(credentials) {
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
            throw new Error("Invalid credentials.");
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials.");
          }

          if (!user.isVerified) {
            throw new Error("AccountNotVerified");
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
          if (error instanceof Error) {
            throw error;
          }
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

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
