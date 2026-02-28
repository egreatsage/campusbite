import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";


export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session || !["STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const { isOutOfStock } = await req.json();

    const updatedItem = await prisma.foodItem.update({
      where: { id: id },
      data: { isOutOfStock: isOutOfStock }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Inventory Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}