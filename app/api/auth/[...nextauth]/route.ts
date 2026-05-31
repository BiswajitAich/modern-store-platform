import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcrypt";
import NextAuth, { type Session, type NextAuthOptions } from "next-auth";
import { compare } from "bcrypt";
import prisma from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    // GOOGLE LOGIN (only for existing users/admins)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // CREDENTIALS LOGIN (email + password)
    CredentialsProvider({
      id: "userCredentials",
      name: "userCredentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          // 1. Find the user
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          console.log("FOUND USER:", user);

          if (!user) {
            return null;
          }

          // 2. Validate password
          const valid = await compare(credentials.password, user.passwordHash);
          console.log("PASSWORD VALID:", valid);
          if (!valid) {
            return null;
          }

          // 3. Return session user
          return {
            id: user.userId,
            last_name: user.lastName ?? "",
            role: "user",
          };
        } catch (error) {
          console.error("REAL PRISMA ERROR:", error);
          throw error;
        }
      },
    }),
    CredentialsProvider({
      id: "adminCredentials",
      name: "adminCredentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // console.log("credientials: ", credentials);

        // 1. Find the user
        const user = await prisma.admin.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        // 2. Validate password
        const valid = await compare(credentials.password, user.passwordHash);

        if (!valid) {
          return null;
        }

        // 3. Return session user
        return {
          id: user.adminId,
          last_name: user.lastName ?? "",
          role: "admin",
          storeSlug: user.storeSlug
        };
      },
    }),
  ],

  callbacks: {
    // Handle JWT token creation
    async jwt({ token, user, account }) {
      // console.log("jwt: ", { token, user });

      // CREDENTIALS LOGIN → user exists here
      if (user) {
        const u = user as JWT;
        token.id = u.id;
        token.role = u.role;
        token.storeSlug = u.storeSlug;
      }

      // GOOGLE LOGIN → logic below
      if (account?.provider === "google") {
        const googleEmail = token.email as string;

        // Find if user/admin exists
        const existingUser = await prisma.user.findUnique({
          where: { email: googleEmail },
        });

        const existingAdmin = await prisma.admin.findUnique({
          where: { email: googleEmail },
        });

        // If not found → reject login
        if (!existingUser && !existingAdmin) {
          throw new Error("Account does not exist. Please sign up first.");
        }

        // User exists
        if (existingUser) {
          token.id = existingUser.userId;
          token.role = "user";
        }

        // Admin exists (allowed by your choice)
        if (existingAdmin) {
          token.id = existingAdmin.adminId;
          token.role = "admin";
          token.storeSlug = existingAdmin.storeSlug;
        }
      }

      return token;
    },

    // Add token data into session
    async session({ session, token }) {
      // console.log("session callback: ", { session, token });

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
        session.user.storeSlug = token.storeSlug as string | undefined;
        // session.user.last_name = token.last_name as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 * 3, // 90 days
  },

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
