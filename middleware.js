// middleware.js
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  // 🚨 CRITICAL FIX: Always allow NextAuth API routes to complete
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 1. Handle Public Routes (Login, Register, etc.)
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/api/register") || 
    pathname.startsWith("/api/mpesa")
  ) {
    // If they are already logged in and try to visit /login, send them home
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 2. Redirect unauthenticated users trying to access protected routes
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

  if (pathname.startsWith("/api/admin") && role !== "ADMIN") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
if (pathname.startsWith("/api/staff") && role !== "STAFF" && role !== "ADMIN") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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