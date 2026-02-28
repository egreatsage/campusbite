import { NextResponse } from "next/server";

import { auth } from "../../../../lib/auth";
import cloudinary from "../../../../lib/cloudinary";


export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the file to a base64 string for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to a specific folder in your Cloudinary account
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "campusbite_food",
    });

    return NextResponse.json({ 
      url: uploadResponse.secure_url, 
      publicId: uploadResponse.public_id 
    }, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Image URL required" }, { status: 400 });
    }

    // Extract the public_id from the Cloudinary URL
    // Example URL: https://res.cloudinary.com/demo/image/upload/v12345/campusbite_food/abc123.jpg
    const parts = url.split("/");
    const folderAndFile = parts.slice(-2).join("/"); // "campusbite_food/abc123.jpg"
    const publicId = folderAndFile.split(".")[0];    // "campusbite_food/abc123"

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Image deletion failed" }, { status: 500 });
  }
}