import AdminNavbar from "@/components/AdminNavbar";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Audit Logs | CampusBite Admin",
};

export default async function AuditLogsPage() {
  const session = await auth();

  // Role Protection
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch the latest 100 logs, including the user (actor) who performed the action
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, 
    include: {
      actor: {
        select: { name: true, email: true, role: true }
      }
    }
  });

  // Helper to format the timestamp
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-KE', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date(date));
  };

  // Helper to style different action types
  const getActionBadgeColor = (action) => {
    if (action.includes("SUCCESS") || action.includes("CREATED")) return "bg-green-100 text-green-800";
    if (action.includes("FAILED") || action.includes("CANCELLED")) return "bg-red-100 text-red-800";
    if (action.includes("UPDATED")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <AdminNavbar user={session.user} />
      
      <header className="mb-8 mt-6">
        <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
        <p className="text-gray-500">Tracking all critical system actions and transactions (Showing last 100)</p>
      </header>

      <main className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details (JSON payload)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap" suppressHydrationWarning>
                      {formatDate(log.createdAt)}
                    </td>
                    
                    <td className="px-4 py-3">
                      {log.actor ? (
                        <div>
                          <p className="font-medium text-gray-900">{log.actor.name}</p>
                          <p className="text-xs text-gray-500">{log.actor.role}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">System Callback</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{log.entityType}</p>
                      <p className="text-xs text-gray-500 font-mono" title="Entity ID">
                        ...{log.entityId.slice(-6)}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <pre className="bg-gray-50 p-2 rounded text-xs text-gray-700 max-w-xs overflow-x-auto border border-gray-100">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}