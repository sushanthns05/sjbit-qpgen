import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full bg-zinc-50 overflow-hidden">
        <div className="w-64 flex-shrink-0 hidden md:block">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
