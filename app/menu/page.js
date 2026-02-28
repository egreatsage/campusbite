"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCartStore } from "../../store/cartStore";

export default function StudentMenu() {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = activeCategory === "All" || food.categoryId === activeCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = inStockOnly ? !food.isOutOfStock : true;
    return matchesCategory && matchesSearch && matchesStock;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="flex space-x-2 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">Loading menu…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">

      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Header row */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
              What are you craving?{" "}
              <span className="text-orange-500">😋</span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Fresh meals, made for students</p>
          </div>

          {/* Search + toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72 lg:w-96">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search food…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-colors select-none shrink-0">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">In-stock only</span>
            </label>
          </div>
        </div>

        {/* Category chips */}
        <div className="max-w-screen-2xl mx-auto overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-10 pb-3">
          <div className="flex space-x-2 w-max">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                activeCategory === "All"
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              All Foods
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Food Grid ── */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-6">
        {/* Result count */}
        {filteredFoods.length > 0 && (
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">
            {filteredFoods.length} item{filteredFoods.length !== 1 ? "s" : ""}
          </p>
        )}

        {filteredFoods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <span className="text-6xl mb-4">🍽️</span>
            <p className="text-lg font-semibold text-gray-500">Nothing found</p>
            <p className="text-sm mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} addToCart={addToCart} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FoodCard({ food, addToCart }) {
  const handleAdd = () => {
    addToCart(food);
    toast.success(`Added ${food.name} to cart!`, { icon: "🛒" });
  };

  return (
    <div
      className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col ${
        food.isOutOfStock ? "opacity-60" : ""
      }`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {food.imageUrl ? (
          <Image
            src={food.imageUrl}
            alt={food.name}
            fill
            quality={100}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-50">🍔</div>
        )}

        {food.isOutOfStock && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">{food.name}</h3>
        {food.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2 flex-grow leading-relaxed">{food.description}</p>
        )}

        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-gray-400 font-medium">Price</span>
              <p className="text-base font-extrabold text-blue-700 leading-none">KSH {food.price}</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={food.isOutOfStock}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-xl shadow-sm transition-all duration-150"
            aria-label={`Add ${food.name} to cart`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
            {food.isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}