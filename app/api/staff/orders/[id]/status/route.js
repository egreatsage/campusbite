import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { auth } from "../../../../../../lib/auth";


export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session || !["STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    // Define the update logic
    let updateData = { orderStatus: status };

    // If marked as COLLECTED, we ensure payment is also marked as PAID
    // This handles the "Cash on Pickup" flow where staff collects money physically
    if (status === "COLLECTED") {
      updateData.paymentStatus = "PAID";
    }

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: updateData
    });

    // TODO: Phase 4 requirement - Trigger SMS via Africa's Talking when status is 'READY'
    if (status === "READY") {
      console.log(`Sending SMS to student for order #${updatedOrder.pickupCode}`);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Status Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}