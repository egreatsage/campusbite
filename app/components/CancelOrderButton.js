"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CancelOrderButton({ orderId }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setIsCancelling(true);
    setShowModal(false);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      toast.success("Order cancelled successfully");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isCancelling}
        className="text-red-500 font-medium text-sm hover:underline transition-colors disabled:opacity-50"
      >
        {isCancelling ? "Cancelling..." : "Cancel Order"}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🗑️</div>
              <h2 className="text-lg font-black text-gray-900">Cancel Order?</h2>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone. Your order will be cancelled immediately.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}