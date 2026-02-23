// middleware.js
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import { NextResponse } from "next/server";

// Initialize NextAuth here using ONLY the lightweight config (no Prisma!)
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  // 1. Allow access to public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/api/mpesa")) {
    return NextResponse.next();
  }

  // 2. Redirect unauthenticated users to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Role-based Route Protection
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/menu", req.url)); 
  }

  if (pathname.startsWith("/staff") && role !== "STAFF" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/menu", req.url)); 
  }

  // 4. Default redirect for root "/"
  if (pathname === "/") {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    if (role === "STAFF") return NextResponse.redirect(new URL("/staff/queue", req.url));
    return NextResponse.redirect(new URL("/menu", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};