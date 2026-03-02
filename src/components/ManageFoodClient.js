"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";
import AdminNavbar from "@/components/AdminNavbar";

export default function ManageFoodClient({ session }) {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    isAvailable: true,
    isOutOfStock: false,
    availableFrom: "",
    availableTo: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [foodRes, catRes] = await Promise.all([
        fetch("/api/admin/food"),
        fetch("/api/admin/categories"),
      ]);
      if (!foodRes.ok || !catRes.ok) throw new Error("Failed to fetch data");
      const foodData = await foodRes.json();
      const catData = await catRes.json();
      setFoods(foodData);
      setCategories(catData);
      if (catData.length > 0 && !formData.categoryId && !editingId) {
        setFormData((prev) => ({ ...prev, categoryId: catData[0].id }));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleEditClick = (food) => {
    setEditingId(food.id);
    setFormData({
      name: food.name,
      description: food.description || "",
      price: food.price,
      categoryId: food.categoryId,
      imageUrl: food.imageUrl || "",
      isAvailable: food.isAvailable,
      isOutOfStock: food.isOutOfStock,
      availableFrom: food.availableFrom || "",
      availableTo: food.availableTo || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ ...initialFormState, categoryId: categories[0]?.id || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Please select a category first");
      return;
    }
    setSubmitting(true);
    const isUpdating = !!editingId;
    const payload = isUpdating ? { ...formData, id: editingId } : formData;
    try {
      const res = await fetch("/api/admin/food", {
        method: isUpdating ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save food item");
      toast.success(isUpdating ? "Food item updated!" : "Food item created!");
      cancelEdit();
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) return;
    try {
      const res = await fetch(`/api/admin/food?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Food item deleted!");
      if (editingId === id) cancelEdit();
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

        .mf-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #fafaf8;
        }

        .mf-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.25rem 4rem;
        }

        .mf-header {
          margin-bottom: 2.5rem;
        }

        .mf-header h1 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.25rem;
        }

        .mf-header p {
          color: #888;
          font-size: 0.875rem;
          margin: 0;
        }

        .mf-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 1024px) {
          .mf-grid {
            grid-template-columns: 320px 1fr;
          }
        }

        /* FORM CARD */
        .mf-form-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #ebebeb;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        @media (min-width: 1024px) {
          .mf-form-card {
            position: sticky;
            top: 1.5rem;
            align-self: start;
          }
        }

        .mf-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .mf-form-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mf-form-title-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e8670a;
          display: inline-block;
          transition: background 0.2s;
        }

        .mf-form-title-dot.editing {
          background: #2d8c4e;
        }

        .mf-cancel-btn {
          font-size: 0.8rem;
          color: #aaa;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }

        .mf-cancel-btn:hover {
          color: #555;
          background: #f3f3f3;
        }

        .mf-field {
          margin-bottom: 1rem;
        }

        .mf-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 500;
          color: #555;
          margin-bottom: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .mf-input, .mf-select, .mf-textarea {
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

        .mf-textarea {
          resize: vertical;
          min-height: 70px;
        }

        .mf-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.85rem center;
          padding-right: 2.2rem;
          cursor: pointer;
        }

        .mf-input:focus, .mf-select:focus, .mf-textarea:focus {
          border-color: #e8670a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(232, 103, 10, 0.1);
        }

        .mf-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .mf-divider {
          border: none;
          border-top: 1.5px solid #f0f0f0;
          margin: 1rem 0;
        }

        /* Checkboxes */
        .mf-checks {
          display: flex;
          gap: 1.5rem;
        }

        .mf-check-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #444;
          user-select: none;
        }

        .mf-check-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #e8670a;
          cursor: pointer;
        }

        .mf-check-label.oos input[type="checkbox"] {
          accent-color: #c0392b;
        }

        /* Submit Button */
        .mf-submit-btn {
          width: 100%;
          padding: 0.75rem 1rem;
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

        .mf-submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .mf-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .mf-submit-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .mf-submit-btn.add {
          background: linear-gradient(135deg, #f07b1d, #e8670a);
        }

        .mf-submit-btn.edit {
          background: linear-gradient(135deg, #3aac64, #2d8c4e);
        }

        /* LIST CARD */
        .mf-list-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #ebebeb;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .mf-list-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mf-count-badge {
          background: #fff3e8;
          color: #e8670a;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.15rem 0.55rem;
          border-radius: 20px;
        }

        /* Food Items */
        .mf-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mf-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem;
          border: 1.5px solid #f0f0f0;
          border-radius: 12px;
          transition: border-color 0.15s, background 0.15s;
        }

        .mf-item:hover {
          background: #fafaf8;
          border-color: #e8e8e8;
        }

        .mf-item.active-edit {
          background: #f0fbf4;
          border-color: #b8e8ca;
        }

        .mf-item-img {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          overflow: hidden;
          background: #f3f3f1;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          position: relative;
        }

        .mf-item-body {
          flex: 1;
          min-width: 0;
        }

        .mf-item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .mf-item-name {
          font-weight: 600;
          font-size: 0.92rem;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mf-item-meta {
          font-size: 0.8rem;
          color: #999;
          margin-top: 0.15rem;
        }

        .mf-item-meta strong {
          color: #e8670a;
          font-weight: 600;
        }

        .mf-item-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: 0.5rem;
        }

        .mf-tag {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .mf-tag.hidden {
          background: #f0f0f0;
          color: #888;
        }

        .mf-tag.oos {
          background: #fff0ef;
          color: #c0392b;
        }

        .mf-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .mf-action-btn {
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.3rem 0.7rem;
          border-radius: 7px;
          border: 1.5px solid transparent;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          background: none;
          white-space: nowrap;
        }

        .mf-action-btn.edit-btn {
          color: #2d8c4e;
          border-color: #b8e8ca;
          background: #f0fbf4;
        }

        .mf-action-btn.edit-btn:hover {
          background: #2d8c4e;
          color: #fff;
          border-color: #2d8c4e;
        }

        .mf-action-btn.delete-btn {
          color: #c0392b;
          border-color: #f5c6c2;
          background: #fff5f4;
        }

        .mf-action-btn.delete-btn:hover {
          background: #c0392b;
          color: #fff;
          border-color: #c0392b;
        }

        /* Loading */
        .mf-loading {
          display: flex;
          gap: 6px;
          align-items: center;
          padding: 3rem;
          justify-content: center;
        }

        .mf-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e8670a;
          animation: mf-bounce 1.2s infinite;
        }

        .mf-dot:nth-child(2) { animation-delay: 0.2s; background: #2d8c4e; }
        .mf-dot:nth-child(3) { animation-delay: 0.4s; background: #c0392b; }

        @keyframes mf-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .mf-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #aaa;
          font-size: 0.9rem;
        }

        .mf-empty-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          display: block;
          opacity: 0.5;
        }
      `}</style>

      <div className="mf-root">
        <AdminNavbar user={session?.user} />

        {loading ? (
          <div className="mf-loading">
            <div className="mf-dot" />
            <div className="mf-dot" />
            <div className="mf-dot" />
          </div>
        ) : (
          <div className="mf-wrap">
            <div className="mf-header">
              <h1>Manage Menu</h1>
              <p>Add, edit, and remove food items from the campus menu.</p>
            </div>

            <div className="mf-grid">
              {/* FORM */}
              <div className="mf-form-card">
                <div className="mf-form-header">
                  <span className="mf-form-title">
                    <span className={`mf-form-title-dot ${editingId ? "editing" : ""}`} />
                    {editingId ? "Edit Item" : "New Item"}
                  </span>
                  {editingId && (
                    <button onClick={cancelEdit} className="mf-cancel-btn">✕ Cancel</button>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mf-field">
                    <label className="mf-label">Food Image</label>
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    />
                  </div>

                  <div className="mf-field">
                    <label className="mf-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Chicken Burger"
                      className="mf-input"
                    />
                  </div>

                  <div className="mf-input-row">
                    <div className="mf-field">
                      <label className="mf-label">Price (KSH)</label>
                      <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0"
                        className="mf-input"
                      />
                    </div>
                    <div className="mf-field">
                      <label className="mf-label">Category</label>
                      <select
                        name="categoryId"
                        required
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="mf-select"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mf-field">
                    <label className="mf-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Short description of the meal..."
                      className="mf-textarea"
                    />
                  </div>

                  <hr className="mf-divider" />

                  <div className="mf-input-row">
                    <div className="mf-field">
                      <label className="mf-label">Available From</label>
                      <input
                        type="time"
                        name="availableFrom"
                        value={formData.availableFrom}
                        onChange={handleChange}
                        className="mf-input"
                      />
                    </div>
                    <div className="mf-field">
                      <label className="mf-label">Available To</label>
                      <input
                        type="time"
                        name="availableTo"
                        value={formData.availableTo}
                        onChange={handleChange}
                        className="mf-input"
                      />
                    </div>
                  </div>

                  <div className="mf-checks mf-field">
                    <label className="mf-check-label">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleChange}
                      />
                      Active Listing
                    </label>
                    <label className="mf-check-label oos">
                      <input
                        type="checkbox"
                        name="isOutOfStock"
                        checked={formData.isOutOfStock}
                        onChange={handleChange}
                      />
                      Out of Stock
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`mf-submit-btn ${editingId ? "edit" : "add"}`}
                  >
                    {submitting ? "Saving…" : editingId ? "Update Food Item" : "Add Food Item"}
                  </button>
                </form>
              </div>

              {/* FOOD LIST */}
              <div className="mf-list-card">
                <div className="mf-list-title">
                  Current Menu
                  {foods.length > 0 && (
                    <span className="mf-count-badge">{foods.length}</span>
                  )}
                </div>

                {foods.length === 0 ? (
                  <div className="mf-empty">
                    <span className="mf-empty-icon">🍽️</span>
                    No food items yet — add your first meal!
                  </div>
                ) : (
                  <div className="mf-items">
                    {foods.map((food) => (
                      <div
                        key={food.id}
                        className={`mf-item ${editingId === food.id ? "active-edit" : ""}`}
                      >
                        <div className="mf-item-img">
                          {food.imageUrl ? (
                            <Image
                              src={food.imageUrl}
                              alt={food.name}
                              fill
                              className="object-cover"
                              sizes="60px"
                            />
                          ) : (
                            "🍔"
                          )}
                        </div>

                        <div className="mf-item-body">
                          <div className="mf-item-top">
                            <div style={{ minWidth: 0 }}>
                              <div className="mf-item-name">{food.name}</div>
                              <div className="mf-item-meta">
                                {food.category?.name} &nbsp;·&nbsp; <strong>KSH {food.price}</strong>
                              </div>
                              <div className="mf-item-tags">
                                {!food.isAvailable && <span className="mf-tag hidden">Hidden</span>}
                                {food.isOutOfStock && <span className="mf-tag oos">Out of Stock</span>}
                              </div>
                            </div>

                            <div className="mf-actions">
                              <button
                                onClick={() => handleEditClick(food)}
                                className="mf-action-btn edit-btn"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(food.id)}
                                className="mf-action-btn delete-btn"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}