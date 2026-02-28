"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore";

export default function CheckoutPage() {
  const router = useRouter();

  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isMounted, setIsMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("MPESA");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex space-x-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">Loading checkout…</p>
    </div>
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-7xl mb-5">🛒</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-8 text-center text-sm">Looks like you haven't added any delicious food yet.</p>
        <Link
          href="/menu"
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Browse Menu
        </Link>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (paymentMethod === "MPESA" && !phone) {
      toast.error("Please enter your M-Pesa phone number.");
      return;
    }
    setIsProcessing(true);
    try {
      const payload = {
        items: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
        totalAmount: getTotalPrice(),
        paymentMethod,
        phone: paymentMethod === "MPESA" ? phone : null,
      };
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to place order");

      if (paymentMethod === "CASH") {
        toast.success("Order placed successfully!");
        clearCart();
        router.push("/orders");
      } else if (paymentMethod === "MPESA") {
        toast.success("M-Pesa prompt sent. Please enter your PIN.");
        pollOrderStatus(data.orderId);
      }
    } catch (error) {
      toast.error(error.message || "Failed to place order");
      setIsProcessing(false);
    }
  };

  const pollOrderStatus = (orderId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) return;
        const orderData = await res.json();
        if (orderData.paymentStatus === "PAID") {
          clearInterval(interval);
          toast.success("Payment received successfully!");
          clearCart();
          router.push("/orders");
        } else if (orderData.paymentStatus === "FAILED" || orderData.orderStatus === "CANCELLED") {
          clearInterval(interval);
          toast.error("Payment failed or was cancelled.");
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    }, 3000);
    setTimeout(() => {
      clearInterval(interval);
      if (isProcessing) {
        toast.error("Payment verification timed out. Please check your orders.");
        setIsProcessing(false);
      }
    }, 120000);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Page Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/menu" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-orange-500 hover:border-orange-300 transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">Checkout</h1>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Review your order and complete payment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT: Order Summary ── */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill quality={100} className="object-cover" sizes="80px" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-2xl">🍔</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                      <p className="text-orange-500 font-bold text-sm mt-0.5">KSH {item.price}</p>

                      <div className="flex items-center gap-3 mt-2">
                        {/* Quantity stepper */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-base font-bold"
                          >−</button>
                          <span className="px-2.5 text-sm font-semibold text-gray-900 w-7 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors text-base font-bold"
                          >+</button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1m-2 0H5" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="font-extrabold text-gray-900 text-base shrink-0">
                      KSH {item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Payment ── */}
          <div className="lg:col-span-5">
            <form onSubmit={handleCheckout} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* M-Pesa option */}
                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "MPESA" ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="MPESA" checked={paymentMethod === "MPESA"} onChange={() => setPaymentMethod("MPESA")} className="w-4 h-4 accent-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">M-Pesa STK Push</p>
                      {paymentMethod === "MPESA" && (
                        <p className="text-xs text-gray-500 mt-0.5">A payment prompt will be sent to your phone immediately.</p>
                      )}
                    </div>
                    <span className="text-2xl">📱</span>
                  </div>
                </label>

                {/* Cash option */}
                <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "CASH" ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === "CASH"} onChange={() => setPaymentMethod("CASH")} className="w-4 h-4 accent-orange-500" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Pay Cash on Pickup</p>
                      {paymentMethod === "CASH" && (
                        <p className="text-xs text-gray-500 mt-0.5">Hand the cash to staff when you collect your food.</p>
                      )}
                    </div>
                    <span className="text-2xl">💵</span>
                  </div>
                </label>

                {/* Phone input */}
                {paymentMethod === "MPESA" && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">M-Pesa Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 2547XXXXXXXX"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all bg-white"
                    />
                    <p className="text-xs text-gray-400 mt-2">Start with 254. Keep your phone nearby to enter your PIN.</p>
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>KSH {getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-extrabold text-gray-900 pt-1">
                    <span>Total to Pay</span>
                    <span className={paymentMethod === "MPESA" ? "text-green-600" : "text-orange-500"}>
                      KSH {getTotalPrice()}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl text-white transition-all active:scale-[0.98] shadow-sm ${
                    isProcessing
                      ? "bg-gray-300 cursor-not-allowed"
                      : paymentMethod === "MPESA"
                      ? "bg-green-600 hover:bg-green-700 shadow-green-200"
                      : "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : paymentMethod === "MPESA" ? (
                    <>
                      <span>📱</span> Pay with M-Pesa
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}