import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ className, children, glow }: { className?: string; children: ReactNode; glow?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/70 backdrop-blur-sm shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]",
        glow && "neon-glow",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }: { title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3", className)}>
      <div className="min-w-0">
        {title && <div className="truncate text-sm font-medium text-foreground">{title}</div>}
        {subtitle && <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
