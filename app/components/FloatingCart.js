"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "../../store/cartStore";

export default function FloatingCart() {
  // We use local state to prevent hydration mismatch errors with Zustand persist
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  if (cart.length === 0) return null; // Hide if cart is empty

  return (
    <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center pointer-events-none">
      <Link 
        href="/checkout" 
        className="w-full max-w-md bg-orange-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between hover:bg-orange-700 transition-transform active:scale-95 pointer-events-auto"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 px-3 py-1 rounded-full font-bold text-sm">
            {getTotalItems()}
          </div>
          <span className="font-medium">View your cart</span>
        </div>
        <div className="font-bold">
          KSH {getTotalPrice()}
        </div>
      </Link>
    </div>
  );
}