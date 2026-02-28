import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage your campus food operations from here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Manage Categories Card */}
        <Link 
          href="/admin/categories" 
          className="block p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-orange-600">Categories</h2>
            <span className="text-2xl">📁</span>
          </div>
          <p className="text-sm text-gray-500">Create and organize menu categories (e.g., Morning Fuel, Midday Meals).</p>
        </Link>

        {/* Placeholder: Manage Food */}
        <div className="block p-6 bg-white rounded-2xl shadow-sm border border-gray-100 opacity-60 cursor-not-allowed">
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Food Items</h2>
            <span className="text-2xl">🍔</span>
          </div>
          <p className="text-sm text-gray-500">Add food items, update pricing, and toggle out-of-stock status. (Coming Next)</p>
        </div>

        {/* Placeholder: Analytics */}
        <div className="block p-6 bg-white rounded-2xl shadow-sm border border-gray-100 opacity-60 cursor-not-allowed">
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Analytics</h2>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-sm text-gray-500">View revenue, popular foods, and peak ordering hours. (Coming Soon)</p>
        </div>

      </div>
    </div>
  );
}