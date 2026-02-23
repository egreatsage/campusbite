// app/api/register/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, phone, password } = await req.json();

    // 1. Basic Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    // 2. Check if a user with this email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email or phone is already registered." }, { status: 409 });
    }

    // 3. Securely hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save the new user to Supabase
    // Note: The schema automatically sets the role to "STUDENT" by default
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred during registration." }, { status: 500 });
  }
}