"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import ImageUpload from "../../components/ImageUpload"; // Adjust path if needed
import AdminNavbar from "../../components/AdminNavbar";
import { auth } from "../../../lib/auth";

export default async function ManageFood() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
   const session = await auth();

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    isAvailable: true,
    isOutOfStock: false,
    availableFrom: "",
    availableTo: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [foodRes, catRes] = await Promise.all([
        fetch("/api/admin/food"),
        fetch("/api/admin/categories")
      ]);
      
      if (!foodRes.ok || !catRes.ok) throw new Error("Failed to fetch data");
      
      const foodData = await foodRes.json();
      const catData = await catRes.json();
      
      setFoods(foodData);
      setCategories(catData);
      
      // Auto-select the first category if none is selected
      if (catData.length > 0 && !formData.categoryId && !editingId) {
        setFormData(prev => ({ ...prev, categoryId: catData[0].id }));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditClick = (food) => {
    setEditingId(food.id);
    setFormData({
      name: food.name,
      description: food.description || "",
      price: food.price,
      categoryId: food.categoryId,
      imageUrl: food.imageUrl || "",
      isAvailable: food.isAvailable,
      isOutOfStock: food.isOutOfStock,
      availableFrom: food.availableFrom || "",
      availableTo: food.availableTo || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ ...initialFormState, categoryId: categories[0]?.id || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Please select a category first");
      return;
    }

    setSubmitting(true);
    const isUpdating = !!editingId;
    const url = "/api/admin/food";
    const payload = isUpdating ? { ...formData, id: editingId } : formData;

    try {
      const res = await fetch(url, {
        method: isUpdating ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save food item");

      toast.success(isUpdating ? "Food item updated!" : "Food item created!");
      cancelEdit();
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;

    try {
      const res = await fetch(`/api/admin/food?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      toast.success("Food item deleted!");
      if (editingId === id) cancelEdit();
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading menu data...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminNavbar user={session.user} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Food Items</h1>
        <p className="text-gray-500 text-sm mt-1">Add, update, and manage your campus menu inventory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CREATE / EDIT FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit lg:sticky lg:top-24">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Food Item" : "Add New Item"}</h2>
            {editingId && (
              <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-800">Cancel</button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Component */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Food Image</label>
              <ImageUpload 
                value={formData.imageUrl} 
                onChange={(url) => setFormData({ ...formData, imageUrl: url })} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (KSH)</label>
                <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" rows="2" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Short description of the meal..."></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                  <input type="time" name="availableFrom" value={formData.availableFrom} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available To</label>
                  <input type="time" name="availableTo" value={formData.availableTo} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none" />
               </div>
            </div>

            <div className="flex space-x-6 border-t border-gray-100 pt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="w-4 h-4 text-orange-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Active Listing</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="isOutOfStock" checked={formData.isOutOfStock} onChange={handleChange} className="w-4 h-4 text-red-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Out of Stock</span>
              </label>
            </div>

            <button type="submit" disabled={submitting} className={`w-full font-medium py-3 px-4 rounded-lg text-white transition-colors mt-4 ${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"} disabled:opacity-50`}>
              {submitting ? "Saving..." : editingId ? "Update Food Item" : "Save Food Item"}
            </button>
          </form>
        </div>

        {/* FOOD LIST */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Current Menu</h2>
          {foods.length === 0 ? (
            <p className="text-gray-500 text-sm">No food items found. Add some meals!</p>
          ) : (
            <div className="space-y-4">
              {foods.map((food) => (
                <div key={food.id} className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {food.imageUrl ? (
                      <Image src={food.imageUrl} alt={food.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-2xl">🍔</span>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{food.name}</h3>
                        <p className="text-sm text-gray-500">{food.category?.name} • KSH {food.price}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button onClick={() => handleEditClick(food)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                        <button onClick={() => handleDelete(food.id)} className="text-sm text-red-600 hover:text-red-800 font-medium">Delete</button>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex space-x-2">
                      {!food.isAvailable && <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">Hidden</span>}
                      {food.isOutOfStock && <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded">Out of Stock</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}