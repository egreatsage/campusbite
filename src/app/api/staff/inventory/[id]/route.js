import { logAuditEvent } from "@/lib/auditLogger";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
;


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

    await logAuditEvent({
      entityType: "FOOD_ITEM",
      entityId: id,
      action: "STOCK_UPDATED",
      actorId: session.user.id,
      details: {
        itemName: updatedItem.name,
        isOutOfStock: isOutOfStock
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Inventory Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}