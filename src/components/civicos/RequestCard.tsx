import { MapPin, Clock, Wallet, Zap, ArrowUpRight } from "lucide-react";
import type { ResourceRequest } from "@/lib/civicos/types";
import { StatusBadge, UrgencyBadge } from "./StatusBadge";
import { formatCurrencyCompact } from "@/lib/civicos/currency";
import { cn } from "@/lib/utils";

export function RequestCard({
  request,
  onMatch,
}: {
  request: ResourceRequest;
  onMatch?: (r: ResourceRequest) => void;
}) {
  const demandPct = Math.round(request.demandScore * 100);

  return (
    <div className="group rounded-2xl border border-border bg-card/30 p-5 transition-all duration-300 hover:bg-card/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-bold text-foreground/70 border border-border uppercase tracking-wider">
              {request.kind.replace("_", " ")}
            </span>
            <UrgencyBadge urgency={request.urgency} />
          </div>
          <div className="mt-2 truncate text-base font-bold text-foreground/90 tracking-tight group-hover:text-primary transition-colors">
            {request.requester}
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" /> Location
          </span>
          <div className="text-[11px] font-medium text-muted-foreground truncate">{request.location}</div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" /> Window
          </span>
          <div className="text-[11px] font-medium text-muted-foreground truncate tabular-nums">
            {request.window.start} – {request.window.end}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> Demand Signal</span>
          <span className="text-foreground/60">{demandPct}%</span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              demandPct > 70 ? "bg-primary shadow-[0_0_8px_rgba(63,107,79,0.3)]" : "bg-muted-foreground/40"
            )}
            style={{ width: `${demandPct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Budget</span>
          <span className="text-sm font-bold text-foreground">
            {request.maxBudget !== undefined ? formatCurrencyCompact(request.maxBudget) : "Grant Based"}
          </span>
        </div>
        <button
          onClick={() => onMatch?.(request)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95"
        >
          Find Match <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
