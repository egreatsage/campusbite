"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ImageUpload({ value, onChange }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Check file size (e.g., limit to 2MB)
if (file.size > 10 * 1024 * 1024) {
  toast.error("Image must be less than 10MB");
  return;
}

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. If there is already an image, delete it from Cloudinary first
      if (value) {
        await fetch("/api/admin/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        });
      }

      // 2. Upload the new image
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      // 3. Pass the new URL back to the parent component
      onChange(data.url);
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset the input
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    setIsUploading(true);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });

      if (!res.ok) throw new Error("Failed to delete image");

      onChange(""); // Clear the value in the parent form
      toast.success("Image removed");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200">
          <Image 
            src={value} 
            alt="Food preview" 
            fill 
            className="object-cover"
            sizes="160px"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="bg-red-600 text-white text-sm font-medium px-3 py-1 rounded hover:bg-red-700"
            >
              {isUploading ? "..." : "Remove"}
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <span className="text-3xl mb-2">📸</span>
            <p className="text-sm text-gray-500 font-medium">
              {isUploading ? "Uploading..." : "Click to upload image"}
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/jpeg, image/png, image/webp" 
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}