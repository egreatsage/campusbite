"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function OrderQueue() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 15000);
    return () => clearInterval(intervalId);
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
      fetchOrders();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const FILTERS = [
    { key: "ALL", label: "All Orders" },
    { key: "PENDING_CASH", label: "Pending Cash" },
    { key: "MPESA_CONFIRMED", label: "M-Pesa" },
    { key: "READY", label: "Ready" },
  ];

  const filteredOrders = orders.filter(order => {
    if (filter === "ALL") return true;
    if (filter === "PENDING_CASH") return order.paymentMethod === "CASH" && order.paymentStatus === "PENDING";
    if (filter === "MPESA_CONFIRMED") return order.paymentMethod === "MPESA" && order.orderStatus === "CONFIRMED";
    if (filter === "READY") return order.orderStatus === "READY";
    return true;
  });

  const getStatusStyle = (status) => {
    const map = {
      CONFIRMED:  { bg: "#eff6ff", color: "#1d4ed8" },
      PREPARING:  { bg: "#fff7ed", color: "#c2410c" },
      READY:      { bg: "#dcfce7", color: "#15803d" },
      COLLECTED:  { bg: "#f3f4f6", color: "#6b7280" },
    };
    return map[status] || { bg: "#f3f4f6", color: "#6b7280" };
  };

  const getStatusDot = (status) => {
    const map = {
      CONFIRMED: "#2563eb",
      PREPARING: "#ea580c",
      READY:     "#16a34a",
      COLLECTED: "#9ca3af",
    };
    return map[status] || "#9ca3af";
  };

  if (isLoading) return (
    <div style={{ textAlign: "center", padding: "60px 24px", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
      <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>🍽️</div>
      Loading live queue…
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');

        .oq-wrap { font-family: 'DM Sans', sans-serif; }

        .oq-filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }

        .oq-filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px; font-weight: 600;
          border: 1.5px solid #e5e7eb;
          background: white; color: #6b7280;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 6px;
        }
        .oq-filter-btn:hover { border-color: #ea580c; color: #ea580c; }
        .oq-filter-btn.active { background: #ea580c; color: white; border-color: #ea580c; }

        .oq-count {
          font-size: 11px; font-weight: 700;
          padding: 1px 7px; border-radius: 20px;
          background: rgba(255,255,255,0.25);
        }
        .oq-filter-btn:not(.active) .oq-count {
          background: #f3f4f6; color: #9ca3af;
        }

        .oq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .oq-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: box-shadow 0.15s, transform 0.15s;
        }
        .oq-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.09); transform: translateY(-1px); }
        .oq-card.cash-pending { border-color: #fed7aa; }

        .oq-card-header {
          padding: 14px 16px;
          border-bottom: 1px solid #f9fafb;
          display: flex; justify-content: space-between; align-items: flex-start;
        }
        .oq-card-header.cash { background: #fff7ed; }
        .oq-card-header.normal { background: #fafafa; }

        .oq-pickup {
          font-size: 22px; font-weight: 900; color: #111827;
          letter-spacing: -0.5px; font-family: 'DM Mono', monospace;
          line-height: 1;
        }
        .oq-time { font-size: 11px; color: #9ca3af; margin-top: 3px; }

        .oq-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .oq-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700;
          padding: 3px 9px; border-radius: 20px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.02em;
        }
        .oq-status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .oq-cash-badge {
          font-size: 11px; font-weight: 700;
          padding: 3px 9px; border-radius: 20px;
          background: #fff7ed; color: #c2410c;
          border: 1px solid #fed7aa;
        }

        .oq-items { padding: 14px 16px; flex-grow: 1; }
        .oq-item {
          display: flex; align-items: baseline; gap: 8px;
          font-size: 13px; color: #374151; font-weight: 500;
          padding: 5px 0;
          border-bottom: 1px solid #f9fafb;
        }
        .oq-item:last-child { border-bottom: none; }
        .oq-qty {
          font-size: 12px; font-weight: 700; color: #9ca3af;
          font-family: 'DM Mono', monospace;
          min-width: 24px;
        }

        .oq-footer {
          padding: 12px 16px;
          background: #fafafa;
          border-top: 1px solid #f3f4f6;
          display: flex; flex-direction: column; gap: 8px;
        }

        .oq-action-btn {
          width: 100%; padding: 10px;
          border: none; border-radius: 9px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
        }
        .oq-action-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .oq-action-btn:active { transform: translateY(0); }
        .oq-btn-prepare { background: #ea580c; color: white; }
        .oq-btn-ready   { background: #2563eb; color: white; }
        .oq-btn-collect { background: #16a34a; color: white; }

        .oq-cash-warning {
          font-size: 11px; font-weight: 700;
          color: #c2410c; text-align: center;
          text-transform: uppercase; letter-spacing: 0.06em;
          background: #fff7ed; padding: 6px 10px;
          border-radius: 7px; border: 1px dashed #fed7aa;
        }

        .oq-empty {
          background: white; border-radius: 14px;
          border: 1px solid #f3f4f6;
          padding: 60px 24px; text-align: center;
          color: #9ca3af; font-size: 14px;
        }

        @media (max-width: 480px) {
          .oq-grid { grid-template-columns: 1fr; }
          .oq-filter-btn { font-size: 12px; padding: 7px 12px; }
        }
      `}</style>

      <div className="oq-wrap">

        {/* Filter Bar */}
        <div className="oq-filter-bar">
          {FILTERS.map(({ key, label }) => {
            const count = key === "ALL" ? orders.length
              : key === "PENDING_CASH" ? orders.filter(o => o.paymentMethod === "CASH" && o.paymentStatus === "PENDING").length
              : key === "MPESA_CONFIRMED" ? orders.filter(o => o.paymentMethod === "MPESA" && o.orderStatus === "CONFIRMED").length
              : orders.filter(o => o.orderStatus === "READY").length;

            return (
              <button
                key={key}
                className={`oq-filter-btn ${filter === key ? "active" : ""}`}
                onClick={() => setFilter(key)}
              >
                {label}
                <span className="oq-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="oq-empty">
            <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.35 }}>🍽️</div>
            No orders match this filter right now.
          </div>
        ) : (
          <div className="oq-grid">
            {filteredOrders.map((order) => {
              const isCashPending = order.paymentMethod === "CASH" && order.paymentStatus === "PENDING";
              const statusStyle = getStatusStyle(order.orderStatus);

              return (
                <div key={order.id} className={`oq-card ${isCashPending ? "cash-pending" : ""}`}>

                  {/* Header */}
                  <div className={`oq-card-header ${isCashPending ? "cash" : "normal"}`}>
                    <div>
                      <div className="oq-pickup">#{order.pickupCode}</div>
                      <div className="oq-time">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="oq-badges">
                      <span
                        className="oq-status-badge"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        <span className="oq-status-dot" style={{ background: getStatusDot(order.orderStatus) }} />
                        {order.orderStatus}
                      </span>
                      {order.paymentMethod === "CASH" && (
                        <span className="oq-cash-badge">KSH {order.totalAmount}</span>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="oq-items">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="oq-item">
                        <span className="oq-qty">{item.quantity}×</span>
                        {item.foodItem.name}
                      </div>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="oq-footer">
                    {order.orderStatus === "CONFIRMED" && (
                      <button className="oq-action-btn oq-btn-prepare" onClick={() => updateStatus(order.id, "PREPARING")}>
                         Start Preparing
                      </button>
                    )}
                    {order.orderStatus === "PREPARING" && (
                      <button className="oq-action-btn oq-btn-ready" onClick={() => updateStatus(order.id, "READY")}>
                         Mark as Ready
                      </button>
                    )}
                    {order.orderStatus === "READY" && (
                      <button className="oq-action-btn oq-btn-collect" onClick={() => updateStatus(order.id, "COLLECTED")}>
                         Confirm Collection
                      </button>
                    )}
                    {isCashPending && (
                      <div className="oq-cash-warning">
                         Collect KSH {order.totalAmount} before handing over
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}