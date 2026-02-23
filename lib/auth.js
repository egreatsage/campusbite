// lib/auth.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config"; // Import the lightweight config

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Spread the config from the other file
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: { 
            OR: [
              { email: credentials.email },
              { phone: credentials.email }
            ]
          }
        });

        if (!user || !user.password) return null; 

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        if (passwordsMatch) return user; 
        
        return null; 
      }
    })
  ],
});