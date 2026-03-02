import OrderQueue from '@/components/staff/OrderQueue'
import React from 'react'

const OrdersPage = () => {
  return (
    <div style={{ minHeight: "100%", background: "#f9fafb", padding: "28px 24px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Page Header */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>
              Order Queue
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "3px 0 0", fontWeight: 500 }}>
              Live updates every 15 seconds
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "6px 12px", borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block", animation: "pulse 2s infinite" }} />
            Live
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          @media (max-width: 640px) {
            .oq-page-inner { padding: 16px 12px !important; }
          }
        `}</style>

        <OrderQueue />
      </div>
    </div>
  )
}

export default OrdersPage