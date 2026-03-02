// src/app/admin/users/page.js
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import UsersClient from "./UsersClient";

export const metadata = {
  title: "Manage Users | CampusBite",
};

export default async function ManageUsersPage() {
  const session = await auth();

  // 1. Strictly protect this route - only ADMIN allowed
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // 2. Fetch all users from the database safely on the server
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <AdminNavbar user={session.user} />
      
      <header className="mb-8 mt-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage staff accounts and view student access.</p>
      </header>

      {/* 3. Pass the fetched data directly to the Client Component */}
      <UsersClient initialUsers={allUsers} />
    </div>
  );
}