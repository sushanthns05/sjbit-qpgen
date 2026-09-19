"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div className="flex items-center gap-4">
        {/* Breadcrumbs can go here */}
        <h2 className="text-lg font-semibold text-zinc-800">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-600">
              {user.displayName || user.email}
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-zinc-100 text-zinc-600 rounded-full">
              {user.role || "VIEWER"}
            </span>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
