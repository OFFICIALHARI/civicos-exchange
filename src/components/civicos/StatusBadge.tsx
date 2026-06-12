import { cn } from "@/lib/utils";
import type { Status, Urgency } from "@/lib/civicos/types";

const STATUS_STYLES: Record<string, string> = {
  available: "bg-success/15 text-success border-success/30",
  in_use: "bg-primary/15 text-primary border-primary/30",
  reserved: "bg-warning/15 text-warning border-warning/30",
  offline: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/15 text-warning border-warning/30",
  matched: "bg-primary/15 text-primary border-primary/30",
  confirmed: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  unmatched: "bg-muted text-muted-foreground border-border",
};

const URGENCY_STYLES: Record<Urgency, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-primary/15 text-primary border-primary/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        STATUS_STYLES[status] ?? STATUS_STYLES.offline,
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
      URGENCY_STYLES[urgency],
    )}>
      {urgency}
    </span>
  );
}
