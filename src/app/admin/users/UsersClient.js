// src/app/admin/users/UsersClient.js
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function UsersClient({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState("STAFF"); // 'STAFF' or 'STUDENT'
  const [loadingId, setLoadingId] = useState(null);

  // Filter users based on the selected tab
  const displayedUsers = users.filter((u) => 
    activeTab === "STAFF" ? (u.role === "STAFF" || u.role === "ADMIN") : u.role === "STUDENT"
  );

  // Toggle user Active/Deactivated status
  const toggleUserStatus = async (userId, currentStatus) => {
    setLoadingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, isActive: !currentStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user");
      }

      // Update local state instantly
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      toast.success(currentStatus ? "Account deactivated" : "Account activated");
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("STAFF")}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            activeTab === "STAFF" ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Staff & Admins
        </button>
        <button
          onClick={() => setActiveTab("STUDENT")}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            activeTab === "STUDENT" ? "border-b-2 border-orange-500 text-orange-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Students
        </button>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500">
              <th className="py-3 font-medium">Name</th>
              <th className="py-3 font-medium">Contact</th>
              <th className="py-3 font-medium">Role</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500 text-sm">
                  No {activeTab.toLowerCase()} accounts found.
                </td>
              </tr>
            ) : (
              displayedUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50">
                  <td className="py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="py-4 text-sm text-gray-500">
                    <p>{user.phone}</p>
                    <p className="text-xs">{user.email}</p>
                  </td>
                  <td className="py-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4">
                    {user.isActive ? (
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">Active</span>
                    ) : (
                      <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">Inactive</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    {user.role !== "ADMIN" && (
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        disabled={loadingId === user.id}
                        className={`text-sm font-medium ${
                          user.isActive ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"
                        } disabled:opacity-50`}
                      >
                        {loadingId === user.id ? "Updating..." : user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}