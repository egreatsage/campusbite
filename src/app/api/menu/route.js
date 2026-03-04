import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // 3. Compute current East Africa Time (UTC+3)
    const now = new Date();
    const eatHours = (now.getUTCHours() + 3) % 24;
    const eatMinutes = now.getUTCMinutes();
    const currentTime = `${eatHours.toString().padStart(2, "0")}:${eatMinutes.toString().padStart(2, "0")}`;

    // 4. Attach isCurrentlyAvailable flag to every food item — never filter them out
    const foods = rawFoods.map((food) => {
      let isCurrentlyAvailable = true;

      if (food.availableFrom || food.availableTo) {
        if (food.availableFrom) {
          isCurrentlyAvailable = isCurrentlyAvailable && currentTime >= food.availableFrom;
        }
        if (food.availableTo) {
          isCurrentlyAvailable = isCurrentlyAvailable && currentTime <= food.availableTo;
        }
      }

      return {
        ...food,
        isCurrentlyAvailable,
      };
    });

    // 5. Sort: currently available items first, then upcoming items ordered by availableFrom
    foods.sort((a, b) => {
      if (a.isCurrentlyAvailable && !b.isCurrentlyAvailable) return -1;
      if (!a.isCurrentlyAvailable && b.isCurrentlyAvailable) return 1;
      // Both unavailable — sort by when they become available next
      if (!a.isCurrentlyAvailable && !b.isCurrentlyAvailable) {
        const aFrom = a.availableFrom ?? "99:99";
        const bFrom = b.availableFrom ?? "99:99";
        return aFrom.localeCompare(bFrom);
      }
      return 0;
    });

    return NextResponse.json({ categories, foods, currentTime });
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}