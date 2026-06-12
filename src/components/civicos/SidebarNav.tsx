import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Store, Boxes, Inbox, Activity, BookOpenText,
  Sparkles, BarChart3, Settings, Zap, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/resources", label: "Resources", icon: Boxes },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/matching", label: "Live Matching", icon: Activity },
  { to: "/ledger", label: "Ledger", icon: BookOpenText },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex",
        collapsed ? "w-[68px]" : "w-[232px]",
        "transition-[width] duration-200 ease-out",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
          <Zap className="h-4 w-4" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">CivicOS</div>
            <div className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Resource Exchange</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Operate
          </div>
        )}
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                  )}
                >
                  <span className="relative">
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                    {active && (
                      <span className="absolute -left-2.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                    )}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
