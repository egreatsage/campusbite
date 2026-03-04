import { logAuditEvent } from "@/lib/auditLogger";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session || !["STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    // 1. Fetch the old order first to prevent ReferenceErrors!
    const oldOrder = await prisma.order.findUnique({ where: { id } });
    if (!oldOrder) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let updateData = { orderStatus: status };

    // 2. Handle Cash on Pickup / Collection logic
    if (status === "COLLECTED") {
      updateData.paymentStatus = "PAID";
    }

    // 3. Handle No-Shows (Uncollected)
    if (status === "UNCOLLECTED") {
      // You can decide if you want to refund or just mark as failed
      updateData.orderStatus = "UNCOLLECTED"; 
    }

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: updateData
    });

    await logAuditEvent({
      entityType: "ORDER",
      entityId: id,
      action: "STATUS_UPDATED",
      actorId: session.user.id,
      details: {
        newStatus: status,
        paymentStatusChangedToPaid: status === "COLLECTED" && oldOrder.paymentStatus !== "PAID"
      }
    });

    if (status === "READY") {
      console.log(`Sending SMS to student for order #${updatedOrder.pickupCode}`);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Status Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}