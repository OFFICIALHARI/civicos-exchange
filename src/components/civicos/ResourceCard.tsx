import { MapPin, Tag, User, BarChart2, ExternalLink } from "lucide-react";
import type { Resource } from "@/lib/civicos/types";
import { StatusBadge } from "./StatusBadge";
import { formatCurrencyCompact } from "@/lib/civicos/currency";
import { cn } from "@/lib/utils";

export function ResourceCard({
  resource,
  onView,
}: {
  resource: Resource;
  onView?: (r: Resource) => void;
}) {
  const utilization = Math.round((resource.utilization ?? 0) * 100);

  return (
    <div className="group rounded-2xl border border-border bg-card/30 p-5 transition-all duration-300 hover:bg-card/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-wider">
              {resource.kind.replace("_", " ")}
            </span>
          </div>
          <div className="mt-2 truncate text-base font-bold text-foreground/90 tracking-tight group-hover:text-primary transition-colors">
            {resource.title}
          </div>
        </div>
        <StatusBadge status={resource.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1">
            <MapPin className="h-2.5 w-2.5" /> Location
          </span>
          <div className="text-[11px] font-medium text-muted-foreground truncate">{resource.location}</div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1">
            <User className="h-2.5 w-2.5" /> Owner
          </span>
          <div className="text-[11px] font-medium text-muted-foreground truncate">{resource.owner}</div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          <span className="flex items-center gap-1"><BarChart2 className="h-2.5 w-2.5" /> Utilization</span>
          <span className="text-foreground/60">{utilization}%</span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              utilization > 80 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" : "bg-primary shadow-[0_0_8px_rgba(63,107,79,0.3)]"
            )}
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Rate</span>
          <span className="text-sm font-bold text-foreground">
            {resource.pricePerHour !== undefined ? `${formatCurrencyCompact(resource.pricePerHour)}/hr` : "Free"}
          </span>
        </div>
        <button
          onClick={() => onView?.(resource)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95"
        >
          View <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
