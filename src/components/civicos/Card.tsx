import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({
  className,
  children,
  glow,
}: {
  className?: string;
  children: ReactNode;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/30 backdrop-blur-md shadow-sm transition-all duration-300 hover:bg-card/40 hover:border-border/80",
        glow && "forest-glow",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border/40 px-6 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        {title && <div className="truncate text-sm font-semibold text-foreground/90 tracking-tight">{title}</div>}
        {subtitle && <div className="mt-1 text-xs text-muted-foreground/60 font-medium">{subtitle}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
