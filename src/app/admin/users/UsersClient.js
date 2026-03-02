"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function UsersClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState("STAFF");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", role: "STAFF", password: "", isActive: true,
  });

  const displayedUsers = users.filter((u) =>
    activeTab === "STAFF" ? (u.role === "STAFF" || u.role === "ADMIN") : u.role === "STUDENT"
  );

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", phone: "", role: "STAFF", password: "", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone || "", role: user.role, isActive: user.isActive, password: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isUpdating = !!editingUser;
    const url = "/api/admin/users";
    const method = isUpdating ? "PUT" : "POST";
    const payload = isUpdating ? { ...formData, id: editingUser.id } : formData;

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isUpdating) {
        setUsers(users.map(u => u.id === editingUser.id ? data.user : u));
        toast.success("User updated successfully!");
      } else {
        setUsers([data.user, ...users]);
        toast.success("User created successfully!");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    const confirmMsg = user.isActive ? "Deactivate this account?" : "Activate this account?";
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, isActive: !user.isActive }) });
      if (!res.ok) throw new Error("Failed to update status");
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !user.isActive } : u));
      toast.success("Status updated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers(users.filter(u => u.id !== id));
      toast.success("User deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const roleColors = {
    ADMIN: "bg-orange-100 text-orange-700 border border-orange-200",
    STAFF: "bg-green-100 text-green-700 border border-green-200",
    STUDENT: "bg-blue-100 text-blue-700 border border-blue-200",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .users-card { font-family: 'DM Sans', sans-serif; }

        .tab-btn {
          position: relative;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .tab-btn::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: #ea580c;
          transform: scaleX(0);
          transition: transform 0.2s;
        }
        .tab-btn.active { color: #ea580c; }
        .tab-btn.active::after { transform: scaleX(1); }
        .tab-btn:not(.active):hover { color: #374151; }

        .add-btn {
          background: #ea580c;
          color: white;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .add-btn:hover { background: #c2410c; transform: translateY(-1px); }
        .add-btn:active { transform: translateY(0); }

        .user-table { width: 100%; border-collapse: collapse; min-width: 520px; }
        .user-table th {
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9ca3af;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }
        .user-table td {
          padding: 13px 12px;
          border-bottom: 1px solid #f9fafb;
          vertical-align: middle;
        }
        .user-table tr:last-child td { border-bottom: none; }
        .user-table tbody tr { transition: background 0.1s; }
        .user-table tbody tr:hover { background: #fafafa; }

        .avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fdba74, #ea580c);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600; color: white;
          flex-shrink: 0;
        }
        .avatar.green { background: linear-gradient(135deg, #86efac, #16a34a); }

        .status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 500;
          padding: 4px 10px; border-radius: 20px;
          border: none; cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }
        .status-pill:hover { opacity: 0.8; transform: scale(0.97); }
        .status-pill.active { background: #dcfce7; color: #15803d; }
        .status-pill.inactive { background: #fee2e2; color: #dc2626; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        .role-tag {
          display: inline-block;
          font-size: 11px; font-weight: 600;
          padding: 3px 9px; border-radius: 6px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.03em;
        }

        .action-btn {
          font-size: 12px; font-weight: 600;
          padding: 5px 11px; border-radius: 6px;
          border: none; cursor: pointer;
          transition: all 0.15s;
        }
        .action-btn.edit { background: #eff6ff; color: #2563eb; }
        .action-btn.edit:hover { background: #dbeafe; }
        .action-btn.delete { background: #fff1f2; color: #dc2626; }
        .action-btn.delete:hover { background: #fee2e2; }

        .empty-state {
          text-align: center; padding: 48px 24px;
          color: #9ca3af; font-size: 14px;
        }
        .empty-icon { font-size: 36px; margin-bottom: 10px; opacity: 0.4; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; z-index: 50;
          backdrop-filter: blur(2px);
        }
        .modal-box {
          background: white;
          border-radius: 16px;
          padding: 28px;
          width: 100%; max-width: 440px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          animation: modalIn 0.2s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-title {
          font-size: 18px; font-weight: 700; color: #111827;
          margin: 0 0 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .field-label {
          display: block; font-size: 12px; font-weight: 600;
          color: #6b7280; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .field-input {
          width: 100%; padding: 9px 12px;
          border: 1.5px solid #e5e7eb; border-radius: 8px;
          font-size: 14px; color: #111827; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .field-input:focus { border-color: #ea580c; }
        .field-input:disabled { background: #f9fafb; color: #9ca3af; }
        .field-input::placeholder { color: #d1d5db; }

        .modal-actions { display: flex; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f3f4f6; }
        .btn-cancel {
          flex: 1; padding: 10px;
          background: #f3f4f6; color: #374151;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-cancel:hover { background: #e5e7eb; }
        .btn-save {
          flex: 1; padding: 10px;
          background: #ea580c; color: white;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-save:hover:not(:disabled) { background: #c2410c; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 640px) {
          .modal-box { padding: 20px; }
          .form-grid { grid-template-columns: 1fr !important; }
          .tab-btn { padding: 12px 16px; font-size: 13px; }
        }
      `}</style>

      <div className="users-card" style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingRight: 20, flexWrap: "wrap", gap: 0 }}>
          <div style={{ display: "flex", flexShrink: 0 }}>
            <button className={`tab-btn ${activeTab === "STAFF" ? "active" : ""}`} onClick={() => setActiveTab("STAFF")}>
              Staff & Admins
              <span style={{ marginLeft: 6, fontSize: 11, background: activeTab === "STAFF" ? "#fff7ed" : "#f3f4f6", color: activeTab === "STAFF" ? "#ea580c" : "#9ca3af", padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>
                {users.filter(u => u.role === "STAFF" || u.role === "ADMIN").length}
              </span>
            </button>
            <button className={`tab-btn ${activeTab === "STUDENT" ? "active" : ""}`} onClick={() => setActiveTab("STUDENT")}>
              Students
              <span style={{ marginLeft: 6, fontSize: 11, background: activeTab === "STUDENT" ? "#fff7ed" : "#f3f4f6", color: activeTab === "STUDENT" ? "#ea580c" : "#9ca3af", padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>
                {users.filter(u => u.role === "STUDENT").length}
              </span>
            </button>
          </div>
          <button className="add-btn" onClick={openCreateModal} style={{ margin: "10px 0" }}>+ Add User</button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto", padding: "8px 20px 20px" }}>
          {displayedUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <div>No users found in this category.</div>
            </div>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                       
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: "#374151" }}>{user.phone || "—"}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>{user.email}</div>
                    </td>
                    <td>
                      <span className={`role-tag ${roleColors[user.role]}`}>{user.role}</span>
                    </td>
                    <td>
                      <button
                        className={`status-pill ${user.isActive ? "active" : "inactive"}`}
                        onClick={() => toggleStatus(user)}
                      >
                        <span className="status-dot" />
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="action-btn edit" onClick={() => openEditModal(user)}>Edit</button>
                        {user.role !== "ADMIN" && (
                          <button className="action-btn delete" onClick={() => handleDelete(user.id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-box">
            <h2 className="modal-title">{editingUser ? " Edit User" : "New User"}</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="field-label">Full Name</label>
                <input className="field-input" type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="field-label">Email</label>
                  <input className="field-input" type="email" required disabled={!!editingUser} placeholder="john@school.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Phone</label>
                  <input className="field-input" type="text" placeholder="+1 555 000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="field-label">Role</label>
                  <select className="field-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="STUDENT">Student</option>
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">{editingUser ? "New Password" : "Password"}</label>
                  <input className="field-input" type="password" required={!editingUser} placeholder={editingUser ? "Leave blank to keep" : "Min. 8 chars"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Saving…" : editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}