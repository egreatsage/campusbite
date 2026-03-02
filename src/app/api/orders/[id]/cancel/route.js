import { logAuditEvent } from "@/lib/auditLogger";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =await params;

    // 1. Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: id }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Ensure the student owns this order
    if (order.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. THE CANCELLATION CONDITION
    const canCancel = 
      order.orderStatus === "PENDING" || 
      (order.paymentMethod === "CASH" && order.orderStatus === "CONFIRMED");

    if (!canCancel) {
      return NextResponse.json({ 
        error: "This order cannot be cancelled. If you already paid, please see staff at the counter." 
      }, { status: 400 });
    }

    // 4. Update order to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { 
        orderStatus: "CANCELLED",
        paymentStatus: order.paymentMethod === "MPESA" ? "FAILED" : "PENDING" 
      }
    });

    await logAuditEvent({
      entityType: "ORDER",
      entityId: id,
      action: "ORDER_CANCELLED_BY_STUDENT",
      actorId: session.user.id,
      details: {
        previousStatus: order.orderStatus,
        paymentMethod: order.paymentMethod
      }
    });

    return NextResponse.json({ message: "Order cancelled successfully" }, { status: 200 });

  } catch (error) {
    console.error("Cancellation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}