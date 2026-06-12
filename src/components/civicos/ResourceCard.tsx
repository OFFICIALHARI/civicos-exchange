import { MapPin, Clock, Tag } from "lucide-react";
import type { Resource } from "@/lib/civicos/types";
import { StatusBadge } from "./StatusBadge";

const KIND_LABEL: Record<Resource["kind"], string> = {
  parking: "Parking",
  ev_charger: "EV Charger",
  solar_share: "Solar Share",
  community_room: "Community Room",
};

export function ResourceCard({ resource, onAction }: { resource: Resource; onAction?: (r: Resource) => void }) {
  return (
    <div className="group rounded-xl border border-border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {KIND_LABEL[resource.kind]}
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{resource.title}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{resource.owner} · {resource.community}</div>
        </div>
        <StatusBadge status={resource.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
        <dt className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> Location</dt>
        <dd className="text-right truncate">{resource.location}</dd>
        <dt className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> Window</dt>
        <dd className="text-right tabular-nums">{resource.availability.start}–{resource.availability.end}</dd>
        {resource.pricePerHour !== undefined && <>
          <dt className="flex items-center gap-1 text-muted-foreground"><Tag className="h-3 w-3" /> Price</dt>
          <dd className="text-right tabular-nums">€{resource.pricePerHour.toFixed(2)}/h</dd>
        </>}
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Match</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${Math.round((resource.matchScore ?? 0) * 100)}%` }} />
          </div>
          <span className="text-xs font-medium tabular-nums">{Math.round((resource.matchScore ?? 0) * 100)}</span>
        </div>
        <button
          onClick={() => onAction?.(resource)}
          className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs hover:border-primary/40 hover:bg-elevated hover:text-primary"
        >
          View
        </button>
      </div>
    </div>
  );
}
