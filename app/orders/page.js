import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";
import CancelOrderButton from "../components/CancelOrderButton";

const getStatusBadge = (status) => {
  const styles = {
    PENDING:   "bg-gray-100 text-gray-600 border-gray-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PREPARING: "bg-orange-50 text-orange-700 border-orange-200",
    READY:     "bg-green-100 text-green-800 border-green-300 animate-pulse",
    COLLECTED: "bg-gray-100 text-gray-400 border-gray-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
  };
  return styles[status] || styles.PENDING;
};

const statusLabel = {
  PENDING:   "⏳ Pending",
  CONFIRMED: "✅ Confirmed",
  PREPARING: "👨‍🍳 Preparing",
  READY:     "🔔 Ready for Pickup!",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { orderItems: { include: { foodItem: true } } },
  });

  const activeOrders = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.orderStatus)
  );
  const pastOrders = orders.filter((o) =>
    ["COLLECTED", "CANCELLED"].includes(o.orderStatus)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your food & pickup codes</p>
          </div>
          <Link
            href="/menu"
            className="text-sm font-semibold text-white bg-black px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Order More
          </Link>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">🧾</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h2>
            <p className="text-gray-400 text-sm mb-6">You haven't placed any orders.</p>
            <Link
              href="/menu"
              className="inline-block bg-black text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ── ACTIVE ORDERS ── */}
            {activeOrders.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                  Active Orders
                </h2>
                <div className="grid gap-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      {/* Status bar */}
                      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                          {statusLabel[order.orderStatus]}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col sm:flex-row gap-5">

                        {/* Pickup Code */}
                        <div className="sm:w-40 shrink-0 flex flex-col items-center justify-center bg-black text-white rounded-xl p-4 text-center">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                            Pickup Code
                          </span>
                          <span className="text-4xl font-black tracking-tight">
                            #{order.pickupCode}
                          </span>
                          {order.paymentMethod === "CASH" && order.paymentStatus !== "PAID" && (
                            <span className="mt-2 text-xs font-semibold bg-white text-black py-1 px-2 rounded-lg">
                              Pay KSH {order.totalAmount} on pickup
                            </span>
                          )}
                        </div>

                        {/* Items + Footer */}
                        <div className="flex-grow flex flex-col justify-between gap-4">
                          <ul className="space-y-2">
                            {order.orderItems.map((item) => (
                              <li key={item.id} className="flex items-center gap-3 text-sm">
                                <span className="bg-gray-100 text-gray-700 font-bold text-xs px-2 py-0.5 rounded">
                                  {item.quantity}x
                                </span>
                                <span className="text-gray-800 font-medium">{item.foodItem.name}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Total + Cancel */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-xs text-gray-400">Total</span>
                              <p className="font-black text-gray-900 text-lg">KSH {order.totalAmount}</p>
                            </div>
                            {(order.orderStatus === "PENDING" ||
                              (order.paymentMethod === "CASH" && order.orderStatus === "CONFIRMED")) && (
                              <CancelOrderButton orderId={order.id} />
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── ORDER HISTORY ── */}
            {pastOrders.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                  Order History
                </h2>
                <div className="grid gap-3">
                  {pastOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 text-sm">
                            #{order.id.slice(-5).toUpperCase()}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()} &bull;{" "}
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-black text-gray-900">KSH {order.totalAmount}</p>
                        <button className="text-xs text-blue-600 font-semibold hover:underline mt-0.5">
                          Reorder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}