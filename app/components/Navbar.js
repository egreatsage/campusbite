import Link from "next/link";

import LogoutButton from "./LogoutButton";
import { auth } from "../../lib/auth";

export default async function Navbar() {
  // Fetch session on the server
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-orange-600">
            CampusBite 🍔
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <span className="text-sm text-gray-500 hidden md:block">
                  Hi, {user.name}
                </span>

                {/* Role-Based Links */}
                {user.role === "ADMIN" && (
                  <Link href="/admin/dashboard" className="text-sm font-medium text-gray-700 hover:text-orange-600">
                    Dashboard
                  </Link>
                )}
                
                {user.role === "STAFF" && (
                  <Link href="/staff/queue" className="text-sm font-medium text-gray-700 hover:text-orange-600">
                    Orders Queue
                  </Link>
                )}

                <LogoutButton />
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                Log In
              </Link>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}