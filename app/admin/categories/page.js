"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    displayOrder: 0,
  });

  // Fetch categories on load
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      toast.success("Category created successfully!");
      setFormData({ name: "", emoji: "", displayOrder: 0 }); // Reset form
      fetchCategories(); // Refresh list
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Menu Categories</h1>
        <p className="text-gray-500 text-sm mt-1">Add and organize your campus food categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CREATE FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Morning Fuel"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji (Optional)</label>
                <input
                  type="text"
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleChange}
                  placeholder="e.g. 🌅"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-orange-400 mt-2 transition-colors"
            >
              {submitting ? "Saving..." : "Save Category"}
            </button>
          </form>
        </div>

        {/* CATEGORY LIST */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Current Categories</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 text-sm">No categories found. Create your first one!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-500">
                    <th className="py-3 font-medium">Order</th>
                    <th className="py-3 font-medium">Emoji</th>
                    <th className="py-3 font-medium">Name</th>
                    <th className="py-3 font-medium">Slug</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-600">{cat.displayOrder}</td>
                      <td className="py-3 text-xl">{cat.emoji}</td>
                      <td className="py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="py-3 text-sm text-gray-400">{cat.slug}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}