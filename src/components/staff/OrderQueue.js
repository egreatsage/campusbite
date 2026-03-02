"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function OrderQueue() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders function
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Live sync failed. Retrying...");
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Polling (Auto-refresh every 15 seconds)
  useEffect(() => {
    fetchOrders(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);
const updateStatus = async (orderId, newStatus) => {
  try {
    const res = await fetch(`/api/staff/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error("Failed to update status");
    
    toast.success(`Order marked as ${newStatus}`);
    fetchOrders(); // Refresh the list immediately
  } catch (error) {
    toast.error(error.message);
  }
};
  // Filter Logic
  const filteredOrders = orders.filter(order => {
    if (filter === "ALL") return true;
    if (filter === "PENDING_CASH") return order.paymentMethod === "CASH" && order.paymentStatus === "PENDING";
    if (filter === "MPESA_CONFIRMED") return order.paymentMethod === "MPESA" && order.orderStatus === "CONFIRMED";
    if (filter === "READY") return order.orderStatus === "READY";
    return true;
  });


  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading live queue...</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING_CASH", "MPESA_CONFIRMED", "READY"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === f 
                ? "bg-gray-900 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-gray-100 text-center text-gray-500">
          No orders match this filter right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className={`p-3 border-b border-gray-100 flex justify-between items-center ${
                order.paymentMethod === 'CASH' && order.paymentStatus === 'PENDING' ? 'bg-orange-50' : 'bg-gray-50'
              }`}>
                <div>
                  <span className="text-xl font-black text-gray-900 tracking-tight">#{order.pickupCode}</span>
                  <span className="text-xs text-gray-500 block">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                    {order.orderStatus}
                  </span>
                  {order.paymentMethod === "CASH" && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                      CASH: KSH {order.totalAmount}
                    </span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="p-4 flex-grow">
                <ul className="space-y-2 mb-4">
                  {order.orderItems.map(item => (
                    <li key={item.id} className="text-sm font-medium text-gray-800 flex gap-2">
                      <span className="font-bold text-gray-500">{item.quantity}x</span> 
                      {item.foodItem.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto flex flex-col gap-2">
                {order.orderStatus === "CONFIRMED" && (
                  <button
                    onClick={() => updateStatus(order.id, "PREPARING")}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700"
                  >
                    Start Preparing
                  </button>
                )}

                {order.orderStatus === "PREPARING" && (
                  <button
                    onClick={() => updateStatus(order.id, "READY")}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
                  >
                    Mark as Ready
                  </button>
                )}

                {order.orderStatus === "READY" && (
                  <button
                    onClick={() => updateStatus(order.id, "COLLECTED")}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700"
                  >
                    Confirm Collection
                  </button>
                )}

                {order.paymentMethod === "CASH" && order.paymentStatus === "PENDING" && (
                  <p className="text-[10px] text-center text-orange-700 font-bold uppercase tracking-tighter">
                    Collect KSH {order.totalAmount} before handing over food
                  </p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}