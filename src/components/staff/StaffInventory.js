"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function StaffInventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
   const fetchInventory = async () => {
    try {
      const res = await fetch("/api/menu");
      const result = await res.json();
      
      // Check if 'result' is the array itself or an object containing it
      const categories = Array.isArray(result) ? result : result.categories;

      if (!categories) {
        throw new Error("Could not find categories in API response");
      }

      // Now flatten safely
      const allItems = categories.flatMap(cat => cat.foodItems || []);
      setItems(allItems);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory list.");
    }
  };
    fetchInventory();
  }, []);

  const toggleStock = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/staff/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOutOfStock: !currentStatus }),
      });

      if (!res.ok) throw new Error("Update failed");
      
      setItems(items.map(item => 
        item.id === id ? { ...item, isOutOfStock: !currentStatus } : item
      ));
      toast.success("Stock status updated");
    } catch (error) {
      toast.error("Failed to update stock");
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quick Inventory Toggle</h2>
        <input 
          type="text" 
          placeholder="Search food..." 
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
            <div className="flex flex-col">
              <span className={`font-medium ${item.isOutOfStock ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {item.name}
              </span>
              <span className="text-xs text-gray-500">KSH {item.price}</span>
            </div>
            
            <button
              onClick={() => toggleStock(item.id, item.isOutOfStock)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                item.isOutOfStock 
                ? "bg-red-100 text-red-700 hover:bg-red-200" 
                : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {item.isOutOfStock ? "OFF STOCK" : "IN STOCK"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}