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

export async function PUT(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, emoji, displayOrder } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID and Category name are required" }, { status: 400 });
    }

    const slug = generateSlug(name);

    // Check if the NEW slug already exists on a DIFFERENT category
    const existingCategory = await prisma.category.findFirst({
      where: { slug, NOT: { id } }
    });

    if (existingCategory) {
      return NextResponse.json({ error: "Another category with this name already exists." }, { status: 409 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        emoji: emoji || null,
        slug,
        displayOrder: parseInt(displayOrder) || 0,
      },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the ID from the URL search params (e.g., ?id=123)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete category:", error);
    
    // Prisma throws error code P2003 for Foreign Key Constraint failures
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: "Cannot delete this category because it currently contains food items. Move or delete the food items first." 
      }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}