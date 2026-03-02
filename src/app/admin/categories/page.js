"use client";

import AdminNavbar from "@/components/AdminNavbar";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    displayOrder: 0,
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      emoji: category.emoji || "",
      displayOrder: category.displayOrder,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", emoji: "", displayOrder: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const isUpdating = !!editingId;
    const method = isUpdating ? "PUT" : "POST";
    const payload = isUpdating ? { ...formData, id: editingId } : formData;

    try {
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category");
      toast.success(isUpdating ? "Category updated!" : "Category created!");
      cancelEdit();
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");
      toast.success("Category deleted!");
      if (editingId === id) cancelEdit();
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

        .mc-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #fafaf8;
        }

        .mc-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.25rem 4rem;
        }

        .mc-header {
          margin-bottom: 2.5rem;
        }

        .mc-header h1 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.25rem;
        }

        .mc-header p {
          color: #888;
          font-size: 0.875rem;
          margin: 0;
        }

        .mc-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .mc-grid {
            grid-template-columns: 300px 1fr;
          }
        }

        /* FORM CARD */
        .mc-form-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #ebebeb;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        @media (min-width: 768px) {
          .mc-form-card {
            position: sticky;
            top: 1.5rem;
            align-self: start;
          }
        }

        .mc-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .mc-form-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mc-form-title-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e8670a;
          display: inline-block;
          transition: background 0.2s;
        }

        .mc-form-title-dot.editing {
          background: #2d8c4e;
        }

        .mc-cancel-btn {
          font-size: 0.8rem;
          color: #aaa;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }

        .mc-cancel-btn:hover {
          color: #555;
          background: #f3f3f3;
        }

        .mc-field {
          margin-bottom: 1rem;
        }

        .mc-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 500;
          color: #555;
          margin-bottom: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .mc-input {
          width: 100%;
          padding: 0.6rem 0.85rem;
          border: 1.5px solid #e8e8e8;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          color: #1a1a1a;
          background: #fafaf8;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .mc-input:focus {
          border-color: #e8670a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(232, 103, 10, 0.1);
        }

        .mc-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .mc-submit-btn {
          width: 100%;
          padding: 0.7rem 1rem;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.25rem;
          transition: opacity 0.15s, transform 0.1s;
          color: #fff;
          letter-spacing: 0.01em;
        }

        .mc-submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .mc-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .mc-submit-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .mc-submit-btn.add {
          background: linear-gradient(135deg, #f07b1d, #e8670a);
        }

        .mc-submit-btn.edit {
          background: linear-gradient(135deg, #3aac64, #2d8c4e);
        }

        /* TABLE CARD */
        .mc-table-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #ebebeb;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .mc-table-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mc-count-badge {
          background: #fff3e8;
          color: #e8670a;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.15rem 0.55rem;
          border-radius: 20px;
        }

        .mc-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .mc-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 420px;
        }

        .mc-table thead tr {
          border-bottom: 2px solid #f0f0f0;
        }

        .mc-table thead th {
          padding: 0.6rem 0.75rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: left;
        }

        .mc-table thead th:last-child {
          text-align: right;
        }

        .mc-table tbody tr {
          border-bottom: 1px solid #f7f7f7;
          transition: background 0.12s;
        }

        .mc-table tbody tr:last-child {
          border-bottom: none;
        }

        .mc-table tbody tr:hover {
          background: #fafaf8;
        }

        .mc-table tbody tr.active-edit {
          background: #f0fbf4;
        }

        .mc-table td {
          padding: 0.75rem 0.75rem;
          font-size: 0.88rem;
          color: #333;
          vertical-align: middle;
        }

        .mc-table td:last-child {
          text-align: right;
        }

        .mc-order-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          background: #f3f3f1;
          border-radius: 7px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #777;
        }

        .mc-emoji-cell {
          font-size: 1.35rem;
          line-height: 1;
        }

        .mc-name-cell {
          font-weight: 500;
          color: #1a1a1a;
        }

        .mc-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .mc-action-btn {
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.3rem 0.7rem;
          border-radius: 7px;
          border: 1.5px solid transparent;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          background: none;
        }

        .mc-action-btn.edit-btn {
          color: #2d8c4e;
          border-color: #b8e8ca;
          background: #f0fbf4;
        }

        .mc-action-btn.edit-btn:hover {
          background: #2d8c4e;
          color: #fff;
          border-color: #2d8c4e;
        }

        .mc-action-btn.delete-btn {
          color: #c0392b;
          border-color: #f5c6c2;
          background: #fff5f4;
        }

        .mc-action-btn.delete-btn:hover {
          background: #c0392b;
          color: #fff;
          border-color: #c0392b;
        }

        .mc-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #aaa;
          font-size: 0.9rem;
        }

        .mc-empty-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          display: block;
          opacity: 0.5;
        }

        .mc-loading {
          display: flex;
          gap: 6px;
          align-items: center;
          padding: 2rem;
          justify-content: center;
        }

        .mc-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e8670a;
          animation: mc-bounce 1.2s infinite;
        }

        .mc-dot:nth-child(2) { animation-delay: 0.2s; background: #2d8c4e; }
        .mc-dot:nth-child(3) { animation-delay: 0.4s; background: #c0392b; }

        @keyframes mc-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="mc-root">
        <AdminNavbar />
        <div className="mc-wrap">
          <div className="mc-header">
            <h1>Menu Categories</h1>
            <p>Add, update, and remove campus food categories.</p>
          </div>

          <div className="mc-grid">
            {/* FORM */}
            <div className="mc-form-card">
              <div className="mc-form-header">
                <span className="mc-form-title">
                  <span className={`mc-form-title-dot ${editingId ? "editing" : ""}`} />
                  {editingId ? "Edit Category" : "New Category"}
                </span>
                {editingId && (
                  <button onClick={cancelEdit} className="mc-cancel-btn">✕ Cancel</button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mc-field">
                  <label className="mc-label">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Morning Fuel"
                    className="mc-input"
                  />
                </div>

                <div className="mc-input-row">
                  <div className="mc-field">
                    <label className="mc-label">Emoji</label>
                    <input
                      type="text"
                      name="emoji"
                      value={formData.emoji}
                      onChange={handleChange}
                      placeholder="🌅"
                      className="mc-input"
                    />
                  </div>
                  <div className="mc-field">
                    <label className="mc-label">Order</label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleChange}
                      className="mc-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`mc-submit-btn ${editingId ? "edit" : "add"}`}
                >
                  {submitting ? "Saving…" : editingId ? "Update Category" : "Add Category"}
                </button>
              </form>
            </div>

            {/* TABLE */}
            <div className="mc-table-card">
              <div className="mc-table-title">
                Current Categories
                {!loading && categories.length > 0 && (
                  <span className="mc-count-badge">{categories.length}</span>
                )}
              </div>

              {loading ? (
                <div className="mc-loading">
                  <div className="mc-dot" />
                  <div className="mc-dot" />
                  <div className="mc-dot" />
                </div>
              ) : categories.length === 0 ? (
                <div className="mc-empty">
                  <span className="mc-empty-icon">🍽️</span>
                  No categories yet — create your first one!
                </div>
              ) : (
                <div className="mc-table-wrap">
                  <table className="mc-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Emoji</th>
                        <th>Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id} className={editingId === cat.id ? "active-edit" : ""}>
                          <td><span className="mc-order-badge">{cat.displayOrder}</span></td>
                          <td className="mc-emoji-cell">{cat.emoji}</td>
                          <td className="mc-name-cell">{cat.name}</td>
                          <td>
                            <div className="mc-actions">
                              <button
                                onClick={() => handleEditClick(cat)}
                                className="mc-action-btn edit-btn"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                className="mc-action-btn delete-btn"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}