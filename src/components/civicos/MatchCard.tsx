import type { Match } from "@/lib/civicos/types";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, Check } from "lucide-react";

export function MatchConfidenceRing({ value }: { value: number }) {
  const r = 18, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, value));
  return (
    <div className="relative h-12 w-12">
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
        <circle cx="22" cy="22" r={r} stroke="oklch(0.27 0 0)" strokeWidth="3" fill="none" />
        <circle
          cx="22" cy="22" r={r} stroke="oklch(0.92 0.20 122)" strokeWidth="3" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold tabular-nums">
        {Math.round(pct * 100)}
      </div>
    </div>
  );
}

export function MatchCard({ match, onAccept }: { match: Match; onAccept?: (m: Match) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <MatchConfidenceRing value={match.confidence} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="truncate">{match.resourceTitle}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{match.requesterName}</span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">Match {match.id} · score {Math.round(match.confidence * 100)}</div>
          </div>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <ul className="mt-3 space-y-1.5">
        {match.reason.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            <span>{r}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="text-xs text-muted-foreground">
          Matched price: <span className="font-mono text-foreground">{match.matchedPrice !== undefined ? `€${match.matchedPrice.toFixed(2)}` : "—"}</span>
        </div>
        <button onClick={() => onAccept?.(match)} className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          Confirm
        </button>
      </div>
    </div>
  );
}
