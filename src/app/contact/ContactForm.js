"use client";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      toast.success("Message sent!", {
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
        iconTheme: { primary: "#f97316", secondary: "#fff" },
      });


      setFormData({ name: "", email: "", message: "" });
      router.push("/?success=true");
    } catch (error) {
      toast.error(error.message, {
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
     

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#111",
            marginBottom: "6px",
          }}>
            Contact Us
          </h1>
          <p style={{ fontSize: "14px", color: "#888", marginBottom: "32px" }}>
            We'll get back to you within 24 hours.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {[
              { label: "Name", key: "name", type: "text", placeholder: "Jane Smith" },
              { label: "Email", key: "email", type: "email", placeholder: "jane@example.com" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#444",
                  marginBottom: "6px",
                }}>
                  {label}
                </label>
                <input
                  type={type}
                  required
                  placeholder={placeholder}
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: "14px",
                    border: "1.5px solid #e5e5e5",
                    borderRadius: "8px",
                    outline: "none",
                    background: "#fafafa",
                    color: "#111",
                    transition: "border-color 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#f97316"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
                />
              </div>
            ))}

            <div>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "#444",
                marginBottom: "6px",
              }}>
                Message
              </label>
              <textarea
                required
                rows={5}
                placeholder="What's on your mind?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "14px",
                  border: "1.5px solid #e5e5e5",
                  borderRadius: "8px",
                  outline: "none",
                  background: "#fafafa",
                  color: "#111",
                  resize: "vertical",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#f97316"}
                onBlur={(e) => e.target.style.borderColor = "#e5e5e5"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: loading ? "#fdba74" : "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.background = "#ea6c0a"; }}
              onMouseLeave={(e) => { if (!loading) e.target.style.background = "#f97316"; }}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}