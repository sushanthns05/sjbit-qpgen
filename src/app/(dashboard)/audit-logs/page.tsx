import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  let logs: any[] = [];
  try {
    const snapshot = await adminDb.collection("audit_logs").orderBy("timestamp", "desc").limit(100).get();
    logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Failed to load audit logs:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-muted-foreground">System-wide immutable log of user actions.</p>
      </div>

      <div className="rounded-md border bg-white">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 font-medium">Details</th>
              <th className="px-6 py-3 font-medium">User ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {log.userId}
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
