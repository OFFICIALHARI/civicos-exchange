import type { Match } from "@/lib/civicos/types";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, Check, Sparkles, ShieldCheck } from "lucide-react";
import { formatCurrencyCompact } from "@/lib/civicos/currency";
import { cn } from "@/lib/utils";

export function MatchConfidenceRing({ value }: { value: number }) {
  const r = 18,
    c = 2 * Math.PI * r,
    pct = Math.max(0, Math.min(1, value));
  return (
    <div className="relative h-12 w-12 group">
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
        <circle cx="22" cy="22" r={r} stroke="var(--border)" strokeWidth="3" fill="none" opacity="0.3" />
        <circle
          cx="22"
          cy="22"
          r={r}
          stroke="var(--primary)"
          strokeWidth="3"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[10px] font-bold tabular-nums text-foreground/80 group-hover:text-primary transition-colors">
        {Math.round(pct * 100)}%
      </div>
    </div>
  );
}

export function MatchCard({ match, onAccept }: { match: Match; onAccept?: (m: Match) => void }) {
  return (
    <div className="group rounded-2xl border border-border bg-card/30 p-5 transition-all duration-300 hover:bg-card/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <MatchConfidenceRing value={match.confidence} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground/90">
              <span className="truncate">{match.resourceTitle}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              <span className="truncate text-primary">{match.requesterName}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
               <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Match ID</span>
               <span className="text-[10px] font-mono text-muted-foreground/60">{match.id.slice(-8)}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="mt-5 space-y-2 bg-surface/30 rounded-xl p-3 border border-border/40">
        <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-2 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Allocation Logic
        </div>
        <ul className="space-y-2">
          {match.reason.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] font-medium text-muted-foreground/80">
              <div className="mt-1 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Rate</span>
          <span className="text-sm font-bold text-foreground">
            {match.matchedPrice !== undefined ? formatCurrencyCompact(match.matchedPrice) : "Resource Default"}
          </span>
        </div>
        <button
          onClick={() => onAccept?.(match)}
          className={cn(
            "rounded-lg px-4 py-2 text-xs font-bold transition-all active:scale-95 shadow-lg shadow-primary/10",
            match.status === "confirmed" 
              ? "bg-secondary/20 text-muted-foreground border border-border cursor-default"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {match.status === "confirmed" ? "Allocated" : "Confirm Match"}
        </button>
      </div>
    </div>
  );
}
