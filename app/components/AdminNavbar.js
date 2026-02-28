"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";


export default function AdminNavbar({ user }) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";

  const navLinks = isAdmin 
    ? [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Food Items", href: "/admin/food" },
        { name: "Categories", href: "/admin/categories" },
        { name: "Staff Mgmt", href: "/admin/users" }, // Phase 6 task
      ]
    : [
        { name: "Kitchen Queue", href: "/staff/dashboard" },
      ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-orange-600 text-xl">
            CampusBite {isAdmin ? "Admin" : "Staff"}
          </Link>
          
          <div className="hidden md:flex gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  pathname === link.href 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {user?.name} ({user?.role})
          </span>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}