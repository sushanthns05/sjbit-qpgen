"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Database,
  Layers,
  FileBadge,
  History,
  BarChart,
  Shield,
  Settings,
  Bot,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "AI Draft", icon: Bot, href: "/ai-draft" },
  { label: "Syllabus", icon: FileText, href: "/syllabus" },
  { label: "Question Bank", icon: Database, href: "/questions" },
  { label: "Templates", icon: FileText, href: "/templates" },
  { label: "Blueprints", icon: LayoutTemplate, href: "/blueprints" },
  { label: "Generate Paper", icon: Sparkles, href: "/generate" },
  { label: "Paper History", icon: History, href: "/paper-history" },
  { label: "Analytics", icon: BarChart, href: "/analytics" },
  { label: "Audit Logs", icon: Shield, href: "/audit-logs" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-zinc-950 text-zinc-100 border-r border-zinc-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">SJBIT QP Gen</h1>
        <p className="text-xs text-zinc-400 mt-1">Confidential System</p>
      </div>
      <div className="flex-1 px-3 space-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-zinc-50",
                isActive ? "bg-zinc-800 text-zinc-50" : "text-zinc-400 hover:bg-zinc-800/50"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
