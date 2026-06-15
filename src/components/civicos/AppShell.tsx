import type { ReactNode } from "react";
import { SidebarNav } from "./SidebarNav";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";

export function AppShell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex min-w-0 flex-1 relative">
          <main className="min-w-0 flex-1 px-4 py-8 md:px-8 lg:px-10 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
          {right && (
            <aside className="hidden w-[360px] shrink-0 border-l border-border bg-surface/20 px-6 py-8 xl:block backdrop-blur-3xl shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.2)] z-10">
              {right}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-3xl font-bold tracking-tight text-foreground/90">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed font-medium max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
