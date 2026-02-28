import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";


export async function GET() {
  try {
    // 1. Fetch categories ordered by displayOrder
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
    });

    // 2. Fetch only ACTIVE food items
    const rawFoods = await prisma.foodItem.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: "desc" },
    });

    // 3. Smart Time Filtering (assuming UTC+3 for Kenya/East Africa Time)
    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24;
    const eatMinutes = now.getUTCMinutes();
    const currentTime = `${eatHours.toString().padStart(2, "0")}:${eatMinutes.toString().padStart(2, "0")}`;

    const foods = rawFoods.filter((food) => {
      if (!food.availableFrom && !food.availableTo) return true; // Available all day
      
      let isWithinTime = true;
      if (food.availableFrom) {
        isWithinTime = isWithinTime && currentTime >= food.availableFrom;
      }
      if (food.availableTo) {
        isWithinTime = isWithinTime && currentTime <= food.availableTo;
      }
      return isWithinTime;
    });

    return NextResponse.json({ categories, foods });
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}