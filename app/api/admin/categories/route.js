import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";


// Helper function to generate a URL-friendly slug
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export async function GET(req) {
  try {
    // 1. Authenticate and authorize
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Fetch categories
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // 1. Authenticate and authorize
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { name, emoji, displayOrder } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = generateSlug(name);

    // 3. Check for existing slug to prevent unique constraint errors
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
    }

    // 4. Create category in database
    const newCategory = await prisma.category.create({
      data: {
        name,
        emoji: emoji || null,
        slug,
        displayOrder: parseInt(displayOrder) || 0,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}