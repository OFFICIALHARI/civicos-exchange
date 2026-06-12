import { MapPin, Clock, Wallet, Play } from "lucide-react";
import type { ResourceRequest } from "@/lib/civicos/types";
import { StatusBadge, UrgencyBadge } from "./StatusBadge";

export function RequestCard({ request, onMatch }: { request: ResourceRequest; onMatch?: (r: ResourceRequest) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4 transition-colors hover:bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{request.kind.replace("_", " ")}</div>
          <div className="mt-0.5 truncate text-sm font-semibold">{request.requester}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <UrgencyBadge urgency={request.urgency} />
          <StatusBadge status={request.status} />
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
        <dt className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> Location</dt>
        <dd className="text-right">{request.location}</dd>
        <dt className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> Window</dt>
        <dd className="text-right tabular-nums">{request.window.start}–{request.window.end}</dd>
        {request.maxBudget !== undefined && <>
          <dt className="flex items-center gap-1 text-muted-foreground"><Wallet className="h-3 w-3" /> Budget</dt>
          <dd className="text-right tabular-nums">€{request.maxBudget.toFixed(2)}</dd>
        </>}
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Demand</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-warning" style={{ width: `${Math.round(request.demandScore * 100)}%` }} />
          </div>
          <span className="text-xs tabular-nums">{Math.round(request.demandScore * 100)}</span>
        </div>
        <button onClick={() => onMatch?.(request)} className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          <Play className="h-3 w-3" /> Match
        </button>
      </div>
    </div>
  );
}
