// src/app/api/admin/users/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req) {
  try {
    const session = await auth();
    
    // Security Check: Only Admins can modify users
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent Admin from deactivating themselves
    if (id === session.user.id) {
        return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("User Update Error:", error);
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}