import { cn } from "@/lib/utils";
import type { Status, Urgency } from "@/lib/civicos/types";

const STATUS_STYLES: Record<string, string> = {
  available: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  in_use: "bg-primary/10 text-primary border-primary/20",
  reserved: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  offline: "bg-muted/30 text-muted-foreground/60 border-border/40",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  matched: "bg-primary/10 text-primary border-primary/20",
  confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  unmatched: "bg-muted/30 text-muted-foreground/60 border-border/40",
};

const URGENCY_STYLES: Record<Urgency, string> = {
  low: "bg-muted/30 text-muted-foreground/60 border-border/40",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  high: "bg-primary/10 text-primary border-primary/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-all",
        STATUS_STYLES[status] ?? STATUS_STYLES.offline,
        className,
      )}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        (status === 'available' || status === 'confirmed') ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : 
        (status === 'in_use' || status === 'matched') ? "bg-primary shadow-[0_0_8px_rgba(63,107,79,0.4)]" :
        (status === 'reserved' || status === 'pending') ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
        "bg-current"
      )} />
      {label}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter",
        URGENCY_STYLES[urgency],
      )}
    >
      {urgency}
    </span>
  );
}
