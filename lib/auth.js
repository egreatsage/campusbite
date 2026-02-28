// lib/auth.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config"; 
import prisma from "./prisma"; 



export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: authConfig.pages,
  callbacks: authConfig.callbacks,
  providers: [
    ...authConfig.providers,
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