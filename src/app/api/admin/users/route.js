// src/app/api/admin/users/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs"; // Required for hashing passwords

// 1. CREATE USER (Staff/Admin)
export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { name, email, phone, role, password } = await req.json();

    // Check if email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingUser) return NextResponse.json({ error: "Email or Phone already in use" }, { status: 400 });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, phone, role, password: hashedPassword, isActive: true },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// 2. UPDATE USER (Details, Status, or Password)
export async function PUT(req) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id, name, phone, role, isActive, password } = await req.json();

    if (id === session.user.id && !isActive) {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    const updateData = { name, phone, role, isActive };

    // Only update the password if the admin typed a new one
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// 3. DELETE USER
export async function DELETE(req) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id === session.user.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}