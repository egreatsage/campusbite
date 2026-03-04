"use client";
import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import toast, { Toaster } from "react-hot-toast";

const STATUS_STYLES = {
  UNREAD:   { bg: "#fff4ed", color: "#c2410c", dot: "#f97316" },
  READ:     { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  RESOLVED: { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
};

function MessageCard({ msg, onStatusChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = msg.message.length > 160;
  const s = STATUS_STYLES[msg.status];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        border: "1px solid #f0f0f0",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)")}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "50%",
            background: "#fff4ed", color: "#f97316",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "700", fontSize: "16px", flexShrink: 0,
          }}>
            {msg.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#111" }}>{msg.name}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{msg.email}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span style={{
            background: s.bg, color: s.color,
            fontSize: "11px", fontWeight: "600",
            padding: "3px 10px", borderRadius: "20px",
            display: "flex", alignItems: "center", gap: "5px",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
            {msg.status}
          </span>
          <span style={{ fontSize: "12px", color: "#aaa" }}>
            {new Date(msg.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Message body */}
      <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f5f5f5" }}>
        <p style={{ fontSize: "14px", color: "#444", lineHeight: "1.65", margin: 0 }}>
          {isLong && !expanded ? msg.message.slice(0, 160) + "..." : msg.message}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop: "6px", background: "none", border: "none",
              color: "#f97316", fontSize: "13px", fontWeight: "500",
              cursor: "pointer", padding: 0,
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Actions row */}
      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <select
          value={msg.status}
          onChange={(e) => onStatusChange(msg.id, e.target.value)}
          style={{
            padding: "7px 12px",
            fontSize: "13px",
            border: "1.5px solid #e5e5e5",
            borderRadius: "8px",
            outline: "none",
            color: "#333",
            background: "#fafafa",
            cursor: "pointer",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#f97316")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
        >
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <button
          onClick={() => onDelete(msg.id)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 14px",
            background: "#fff5f5",
            color: "#dc2626",
            border: "1.5px solid #fecaca",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fee2e2";
            e.currentTarget.style.borderColor = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff5f5";
            e.currentTarget.style.borderColor = "#fecaca";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      toast.error("Failed to load messages", {
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/admin/messages/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
      toast.success("Status updated", {
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
        iconTheme: { primary: "#f97316", secondary: "#fff" },
      });
    } catch {
      toast.error("Failed to update status", {
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
      });
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message deleted", {
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
        iconTheme: { primary: "#f97316", secondary: "#fff" },
      });
    } catch {
      toast.error("Failed to delete message", {
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
      });
    }
  };

  const filtered = filter === "ALL" ? messages : messages.filter((m) => m.status === filter);
  const counts = {
    ALL: messages.length,
    UNREAD: messages.filter((m) => m.status === "UNREAD").length,
    READ: messages.filter((m) => m.status === "READ").length,
    RESOLVED: messages.filter((m) => m.status === "RESOLVED").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="top-right" />
      <AdminNavbar />

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Page title */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111", margin: 0 }}>Contact Messages</h1>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "4px" }}>
            {counts.UNREAD > 0 ? `${counts.UNREAD} unread message${counts.UNREAD > 1 ? "s" : ""}` : "All messages read"}
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {["ALL", "UNREAD", "READ", "RESOLVED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: "1.5px solid",
                borderColor: filter === tab ? "#f97316" : "#e5e5e5",
                background: filter === tab ? "#fff4ed" : "#fff",
                color: filter === tab ? "#f97316" : "#666",
                fontSize: "13px",
                fontWeight: filter === tab ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span style={{
                marginLeft: "6px",
                background: filter === tab ? "#f97316" : "#f0f0f0",
                color: filter === tab ? "#fff" : "#888",
                borderRadius: "10px",
                padding: "1px 7px",
                fontSize: "11px",
                fontWeight: "600",
              }}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa", fontSize: "14px" }}>
            Loading messages...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 0", color: "#aaa", fontSize: "14px",
            background: "#fff", borderRadius: "12px", border: "1px solid #f0f0f0",
          }}>
            No messages found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filtered.map((msg) => (
              <MessageCard
                key={msg.id}
                msg={msg}
                onStatusChange={updateStatus}
                onDelete={deleteMessage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}