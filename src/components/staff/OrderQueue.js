"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function OrderQueue() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("ACTIVE");
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

  const TABS = [
    { key: "ACTIVE", label: "Kitchen Queue",    emoji: "🍳" },
    { key: "READY",  label: "Ready for Pickup", emoji: "✅" },
    { key: "PAST",   label: "History",           emoji: "🗂️" },
  ];

  // PENDING, PENDING_CASH, and CONFIRMED are all pre-kitchen statuses — include them all
  const ACTIVE_STATUSES = ["PENDING", "PENDING_CASH", "CONFIRMED", "PREPARING"];
  const READY_STATUSES  = ["READY"];
  const PAST_STATUSES   = ["COLLECTED", "UNCOLLECTED", "CANCELLED"];

  const tabCounts = {
    ACTIVE: orders.filter(o => ACTIVE_STATUSES.includes(o.orderStatus)).length,
    READY:  orders.filter(o => READY_STATUSES.includes(o.orderStatus)).length,
    PAST:   orders.filter(o => PAST_STATUSES.includes(o.orderStatus)).length,
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "ACTIVE") return ACTIVE_STATUSES.includes(order.orderStatus);
    if (activeTab === "READY")  return READY_STATUSES.includes(order.orderStatus);
    if (activeTab === "PAST")   return PAST_STATUSES.includes(order.orderStatus);
    return true;
  });

  const getStatusStyle = (status) => {
    const map = {
      PENDING:       { bg: "#fefce8", color: "#a16207" },
      PENDING_CASH:  { bg: "#fff7ed", color: "#c2410c" },
      CONFIRMED:     { bg: "#eff6ff", color: "#1d4ed8" },
      PREPARING:     { bg: "#fff7ed", color: "#c2410c" },
      READY:         { bg: "#dcfce7", color: "#15803d" },
      COLLECTED:     { bg: "#f3f4f6", color: "#6b7280" },
      UNCOLLECTED:   { bg: "#fef2f2", color: "#b91c1c" },
      CANCELLED:     { bg: "#f3f4f6", color: "#6b7280" },
    };
    return map[status] || { bg: "#f3f4f6", color: "#6b7280" };
  };

  const getStatusDot = (status) => {
    const map = {
      PENDING:       "#ca8a04",
      PENDING_CASH:  "#ea580c",
      CONFIRMED:     "#2563eb",
      PREPARING:     "#ea580c",
      READY:         "#16a34a",
      COLLECTED:     "#9ca3af",
      UNCOLLECTED:   "#ef4444",
      CANCELLED:     "#9ca3af",
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

        /* ── TABS ── */
        .oq-tabs {
          display: flex; gap: 4px;
          background: #f3f4f6;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 20px;
        }
        .oq-tab {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 14px;
          border-radius: 9px;
          font-size: 13px; font-weight: 600;
          border: none; background: transparent; color: #6b7280;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .oq-tab:hover { color: #374151; }
        .oq-tab.active { background: white; color: #111827; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .oq-tab-count {
          font-size: 11px; font-weight: 700;
          padding: 1px 7px; border-radius: 20px;
          background: #e5e7eb; color: #6b7280;
        }
        .oq-tab.active .oq-tab-count {
          background: #ea580c; color: white;
        }

        /* ── GRID ── */
        .oq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* ── CARD ── */
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
        .oq-card.past { opacity: 0.72; }

        .oq-card-header {
          padding: 14px 16px;
          border-bottom: 1px solid #f9fafb;
          display: flex; justify-content: space-between; align-items: flex-start;
        }
        .oq-card-header.cash   { background: #fff7ed; }
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
        .oq-footer-row { display: flex; gap: 8px; }

        .oq-action-btn {
          flex: 1; padding: 10px;
          border: none; border-radius: 9px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.01em;
        }
        .oq-action-btn:hover  { opacity: 0.88; transform: translateY(-1px); }
        .oq-action-btn:active { transform: translateY(0); }
        .oq-btn-prepare { background: #ea580c; color: white; }
        .oq-btn-ready   { background: #2563eb; color: white; }
        .oq-btn-collect { background: #16a34a; color: white; }
        .oq-btn-noshow  {
          background: #fef2f2; color: #b91c1c;
          border: 1px solid #fecaca;
          flex: 0 0 auto; padding: 10px 14px;
        }

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

        @media (max-width: 600px) {
          .oq-grid { grid-template-columns: 1fr; }
          .oq-tabs { gap: 2px; }
          .oq-tab { font-size: 12px; padding: 8px 10px; }
        }
      `}</style>

      <div className="oq-wrap">

        {/* ── Tabs ── */}
        <div className="oq-tabs">
          {TABS.map(({ key, label, emoji }) => (
            <button
              key={key}
              className={`oq-tab ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <span>{emoji} {label}</span>
              <span className="oq-tab-count">{tabCounts[key]}</span>
            </button>
          ))}
        </div>

        {/* ── Orders ── */}
        {filteredOrders.length === 0 ? (
          <div className="oq-empty">
            <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.35 }}>🍽️</div>
            {activeTab === "ACTIVE" && "No active orders right now."}
            {activeTab === "READY"  && "Nothing waiting for pickup."}
            {activeTab === "PAST"   && "No past orders yet."}
          </div>
        ) : (
          <div className="oq-grid">
            {filteredOrders.map((order) => {
              const isCashPending = order.paymentMethod === "CASH" && order.paymentStatus === "PENDING";
              const isPast = PAST_STATUSES.includes(order.orderStatus);
              const statusStyle = getStatusStyle(order.orderStatus);

              return (
                <div
                  key={order.id}
                  className={`oq-card ${isCashPending ? "cash-pending" : ""} ${isPast ? "past" : ""}`}
                >
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
                  {!isPast && (
                    <div className="oq-footer">
                      {["PENDING", "PENDING_CASH", "CONFIRMED"].includes(order.orderStatus) && (
                        <button className="oq-action-btn oq-btn-prepare" onClick={() => updateStatus(order.id, "PREPARING")}>
                          🍳 Start Preparing
                        </button>
                      )}
                      {order.orderStatus === "PREPARING" && (
                        <button className="oq-action-btn oq-btn-ready" onClick={() => updateStatus(order.id, "READY")}>
                          ✅ Mark as Ready
                        </button>
                      )}
                      {order.orderStatus === "READY" && (
                        <>
                          <div className="oq-footer-row">
                            <button className="oq-action-btn oq-btn-collect" onClick={() => updateStatus(order.id, "COLLECTED")}>
                              {order.paymentMethod === "CASH" ? "💵 Confirm Payment & Pickup" : "✅ Confirm Collection"}
                            </button>
                            <button className="oq-action-btn oq-btn-noshow" onClick={() => updateStatus(order.id, "UNCOLLECTED")} title="Mark as No Show">
                              👻 No Show
                            </button>
                          </div>
                          {isCashPending && (
                            <div className="oq-cash-warning">
                              💰 Collect KSH {order.totalAmount} before handing over
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}