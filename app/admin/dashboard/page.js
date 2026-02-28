import { redirect } from "next/navigation";
import prisma from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import LogoutButton from "../../components/LogoutButton";
import AdminNavbar from "../../components/AdminNavbar";

export const metadata = {
  title: "Admin Dashboard | CampusBite",
};

export default async function AdminDashboardPage() {
  const session = await auth();

  // Role Protection
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // Get current date boundaries for "Today" stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Fetch High-Level Revenue Stats
  const stats = await prisma.order.aggregate({
    where: {
      orderStatus: { not: "CANCELLED" },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  // 2. Fetch Today's Specific Stats
  const todayStats = await prisma.order.aggregate({
    where: {
      createdAt: { gte: today },
      orderStatus: { not: "CANCELLED" },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  // 3. Fetch Popular Foods (Top 5)
  const popularItems = await prisma.foodItem.findMany({
    orderBy: { orderCount: 'desc' },
    take: 5,
    select: { name: true, orderCount: true, price: true }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <AdminNavbar user={session.user} />
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Analytics</h1>
          <p className="text-gray-500">Overview of campus sales and operations</p>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            Admin: {session.user.name}
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="space-y-8">
        {/* Revenue and Order Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={`KSH ${stats._sum.totalAmount || 0}`} 
            sub="All-time earnings" 
          />
          <StatCard 
            title="Today's Revenue" 
            value={`KSH ${todayStats._sum.totalAmount || 0}`} 
            sub="Since midnight" 
            highlight
          />
          <StatCard 
            title="Total Orders" 
            value={stats._count.id} 
            sub="Successfully placed" 
          />
          <StatCard 
            title="Today's Orders" 
            value={todayStats._count.id} 
            sub="Volume today" 
          />
        </div>

        {/* Popular Items Preview */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Performing Items</h2>
          <div className="space-y-4">
            {popularItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-50 pb-2">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">KSH {item.price}</p>
                </div>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                  {item.orderCount} orders
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    
    </div>
  );
}

function StatCard({ title, value, sub, highlight = false }) {
  return (
    <div className={`p-6 rounded-xl border border-gray-200 shadow-sm ${highlight ? 'bg-orange-50' : 'bg-white'}`}>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}