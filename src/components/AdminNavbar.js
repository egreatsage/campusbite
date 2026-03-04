"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import LogoutButton from "./LogoutButton";

export default function AdminNavbar({ user }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const navLinks = isAdmin
    ? [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Food Items", href: "/admin/food" },
        { name: "Categories", href: "/admin/categories" },
        { name: "Orders", href: "/admin/orders" },
        { name: "User Mgmt", href: "/admin/users" },
        { name: "Messages", href: "/admin/messages" },
      ]
    : [{ name: "Kitchen Queue", href: "/staff/dashboard" }];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-orange-600 text-xl">
            CampusBite {isAdmin ? "Admin" : "Staff"}
          </Link>

          {/* Desktop Menu */}
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

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {user?.name} ({user?.role})
          </span>
          <LogoutButton />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block text-sm font-medium px-3 py-2 rounded-md ${
                pathname === link.href
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="border-t pt-3 mt-3 space-y-2">
            <span className="block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
              {user?.name} ({user?.role})
            </span>
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  );
}