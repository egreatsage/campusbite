"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCartStore } from "../../store/cartStore";

export default function StudentMenu() {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("/api/menu");
        if (!res.ok) throw new Error("Failed to load menu");
        const data = await res.json();
        
        setCategories(data.categories);
        setFoods(data.foods);
      } catch (error) {
        toast.error("Could not load the menu right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Filter logic
  const filteredFoods = foods.filter((food) => {
    const matchesCategory = activeCategory === "All" || food.categoryId === activeCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = inStockOnly ? !food.isOutOfStock : true;
    
    return matchesCategory && matchesSearch && matchesStock;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-orange-600 font-medium">Loading delicious food...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 md:max-w-3xl md:pt-6">
      
      {/* Search & Header */}
      <div className="bg-white p-4 sticky top-16 z-40 border-b border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">What are you craving? 😋</h1>
        <input
          type="text"
          placeholder="Search for food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-100 text-gray-900 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
        />
        
        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={inStockOnly} 
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">In-Stock Only</span>
          </label>
        </div>
      </div>

      {/* Categories (Horizontal Scroll) */}
      <div className="overflow-x-auto hide-scrollbar bg-white py-3 border-b border-gray-100 sticky top-[160px] z-30">
        <div className="flex px-4 space-x-3 w-max">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeCategory === "All" ? "bg-orange-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Foods
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center space-x-1 ${
                activeCategory === cat.id ? "bg-orange-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Food List */}
      <div className="p-4 space-y-4">
        {filteredFoods.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-4xl mb-3">🍽️</p>
            <p>No food found for your selection.</p>
          </div>
        ) : (
          filteredFoods.map((food) => (
            <div 
              key={food.id} 
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex transition-opacity ${
                food.isOutOfStock ? "opacity-60 grayscale-[30%]" : ""
              }`}
            >
              {/* High Quality Image Render */}
              <div className="w-32 h-32 relative flex-shrink-0 bg-gray-100">
                {food.imageUrl ? (
                  <Image 
                    src={food.imageUrl} 
                    alt={food.name} 
                    fill 
                    quality={100} // Forces maximum quality from Cloudinary
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, 128px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-200">🍔</div>
                )}
                {food.isOutOfStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-wider bg-red-600 px-2 py-1 rounded">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Food Details */}
              <div className="p-3 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-semibold text-gray-900 leading-tight">{food.name}</h3>
                  {food.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{food.description}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-orange-600">KSH {food.price}</span>
                  <button 
  onClick={() => {
    addToCart(food);
    toast.success(`Added ${food.name} to cart!`, { icon: '🛒' });
  }}
  disabled={food.isOutOfStock}
  className="bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors active:scale-95"
>
  +
</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}