"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 🟢 NEW: Track if we are editing an existing category
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    displayOrder: 0,
  });

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

  // 🟢 NEW: Populate the form when "Edit" is clicked
  const handleEditClick = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      emoji: category.emoji || "",
      displayOrder: category.displayOrder,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the form
  };

  // 🟢 NEW: Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", emoji: "", displayOrder: 0 });
  };

  // 🟡 UPDATED: Handle both Create and Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const isUpdating = !!editingId;
    const url = "/api/admin/categories";
    const method = isUpdating ? "PUT" : "POST";
    
    // If updating, we need to include the ID in the payload
    const payload = isUpdating ? { ...formData, id: editingId } : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save category");

      toast.success(isUpdating ? "Category updated!" : "Category created!");
      cancelEdit(); // Reset form and state
      fetchCategories(); // Refresh list
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 🔴 NEW: Handle Deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete category");

      toast.success("Category deleted!");
      // If we deleted the item we were currently editing, reset the form
      if (editingId === id) cancelEdit(); 
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Menu Categories</h1>
        <p className="text-gray-500 text-sm mt-1">Add, update, and remove campus food categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CREATE / EDIT FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
            {editingId && (
              <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-800">
                Cancel
              </button>
            )}
          </div>
          
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
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
              className={`w-full font-medium py-2 px-4 rounded-lg transition-colors mt-2 text-white ${
                editingId 
                  ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400" 
                  : "bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400"
              }`}
            >
              {submitting ? "Saving..." : editingId ? "Update Category" : "Save Category"}
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
                    <th className="py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-600">{cat.displayOrder}</td>
                      <td className="py-3 text-xl">{cat.emoji}</td>
                      <td className="py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="py-3 text-right space-x-3">
                        {/* 🟢 Edit Button */}
                        <button 
                          onClick={() => handleEditClick(cat)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        {/* 🔴 Delete Button */}
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
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