import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";


export async function GET(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all food items and include their category details
    const foods = await prisma.foodItem.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error("Failed to fetch foods:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      name, description, price, imageUrl, categoryId, 
      isAvailable, isOutOfStock, availableFrom, availableTo 
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Name, price, and category are required" }, { status: 400 });
    }

    const newFood = await prisma.foodItem.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        categoryId,
        isAvailable: isAvailable ?? true,
        isOutOfStock: isOutOfStock ?? false,
        availableFrom: availableFrom || null,
        availableTo: availableTo || null,
      },
    });

    return NextResponse.json(newFood, { status: 201 });
  } catch (error) {
    console.error("Failed to create food item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      id, name, description, price, imageUrl, categoryId, 
      isAvailable, isOutOfStock, availableFrom, availableTo 
    } = body;

    if (!id || !name || !price || !categoryId) {
      return NextResponse.json({ error: "ID, name, price, and category are required" }, { status: 400 });
    }

    const updatedFood = await prisma.foodItem.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        categoryId,
        isAvailable: isAvailable ?? true,
        isOutOfStock: isOutOfStock ?? false,
        availableFrom: availableFrom || null,
        availableTo: availableTo || null,
      },
    });

    return NextResponse.json(updatedFood, { status: 200 });
  } catch (error) {
    console.error("Failed to update food item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Food ID is required" }, { status: 400 });
    }

    await prisma.foodItem.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Food deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete food item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}