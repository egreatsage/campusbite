
import { redirect } from "next/navigation";


import { auth } from "../../../lib/auth";
import LogoutButton from "../../components/LogoutButton";
import OrderQueue from "../../components/staff/OrderQueue";
import StaffInventory from "../../components/staff/StaffInventory";

export const metadata = {
  title: "Staff Dashboard | CampusBite",
};

export default async function StaffDashboardPage() {
  const session = await auth();

  // Role Protection
  if (!session || !["STAFF", "ADMIN"].includes(session.user?.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Kitchen Queue</h1>
          <p className="text-gray-500">Auto-updates every 15 seconds. Keep the orders moving!</p>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            👤 {session.user.name} (Staff)
          </span>
          <LogoutButton />
        </div>
      </header>

      <main>
        <StaffInventory/>
        {/* Render the Client Component for the live queue */}
        <OrderQueue />
      </main>
    </div>
  );
}