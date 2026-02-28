"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore";

export default function CheckoutPage() {
  const router = useRouter();
  
  // Zustand Store
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  // Local State
  const [isMounted, setIsMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("MPESA");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Prevent hydration mismatch with Zustand persist
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen flex justify-center items-center">Loading checkout...</div>;

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 text-center">Looks like you haven't added any delicious food yet.</p>
        <Link href="/menu" className="bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors">
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
      // 🚨 Next Step: We will build the /api/orders route to handle this payload
      const payload = {
        items: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
        totalAmount: getTotalPrice(),
        paymentMethod,
        phone: paymentMethod === "MPESA" ? phone : null,
      };

      console.log("Submitting Order:", payload);
      
      // Simulate network request for now
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Order placed successfully!");
      clearCart();
      router.push("/orders"); // Redirect to a future student orders page
      
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 min-h-screen bg-gray-50 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-500 mt-1">Review your order and complete payment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Order Review */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-100 pb-4">Order Summary</h2>
            
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Item Image */}
                  <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill quality={100} className="object-cover" sizes="80px" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-2xl">🍔</span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-orange-600 font-medium text-sm">KSH {item.price}</p>
                    
                    {/* Controls: Quantity & Remove */}
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                        >-</button>
                        <span className="px-3 font-medium text-sm w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >+</button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="font-bold text-gray-900 text-lg sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                    KSH {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Details */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCheckout} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-semibold mb-6 border-b border-gray-100 pb-4">Payment Method</h2>

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-6">
              <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'MPESA' ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center">
                  <input type="radio" name="paymentMethod" value="MPESA" checked={paymentMethod === 'MPESA'} onChange={() => setPaymentMethod('MPESA')} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                  <span className="ml-3 font-semibold text-gray-900">M-Pesa STK Push</span>
                  <span className="ml-auto text-2xl">📱</span>
                </div>
                {paymentMethod === 'MPESA' && (
                  <p className="mt-2 text-sm text-gray-600 ml-8">A payment prompt will be sent to your phone immediately.</p>
                )}
              </label>

              <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'CASH' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center">
                  <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                  <span className="ml-3 font-semibold text-gray-900">Pay Cash on Pickup</span>
                  <span className="ml-auto text-2xl">💵</span>
                </div>
                {paymentMethod === 'CASH' && (
                  <p className="mt-2 text-sm text-gray-600 ml-8">Hand the cash to the staff when you collect your food.</p>
                )}
              </label>
            </div>

            {/* Phone Number Input (Conditional) */}
            {paymentMethod === "MPESA" && (
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 2547XXXXXXXX" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">Start with 254. Ensure this phone is nearby to enter your PIN.</p>
              </div>
            )}

            {/* Total Calculation */}
            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-center text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>KSH {getTotalPrice()}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 mt-4">
                <span>Total to Pay</span>
                <span className={paymentMethod === 'MPESA' ? 'text-green-600' : 'text-orange-600'}>
                  KSH {getTotalPrice()}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className={`w-full font-bold py-4 px-4 rounded-xl text-white transition-all transform active:scale-[0.98] ${
                isProcessing ? 'opacity-70 cursor-not-allowed bg-gray-500' : 
                paymentMethod === 'MPESA' ? 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-200' : 'bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-200'
              }`}
            >
              {isProcessing ? "Processing..." : paymentMethod === 'MPESA' ? "Pay with M-Pesa" : "Confirm Order"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}