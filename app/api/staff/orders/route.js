import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";


export async function GET() {
  try {
    // 1. Verify the user is logged in and is STAFF or ADMIN
    const session = await auth();
    if (!session || !["STAFF", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // 2. Fetch active orders (exclude COLLECTED and CANCELLED)
    const activeOrders = await prisma.order.findMany({
      where: {
        orderStatus: {
          in: ["PENDING", "CONFIRMED", "PREPARING", "READY"]
        }
      },
      orderBy: {
        createdAt: "desc" // Newest first
      },
      include: {
        student: {
          select: { name: true, phone: true }
        },
        orderItems: {
          include: { foodItem: true }
        }
      }
    });

    return NextResponse.json(activeOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}