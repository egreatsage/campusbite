"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
    >
      Log Out
    </button>
  );
}