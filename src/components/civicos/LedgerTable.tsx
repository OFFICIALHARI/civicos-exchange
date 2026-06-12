import type { LedgerEntry } from "@/lib/civicos/types";
import { StatusBadge } from "./StatusBadge";
import { ArrowUpDown, Download, Filter } from "lucide-react";
import { Skeleton } from "./LoadingSkeletons";
import { EmptyState, ErrorState } from "./EmptyState";

export function LedgerTable({
  entries, loading, error, onRetry,
}: { entries?: LedgerEntry[]; loading?: boolean; error?: boolean; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card/60">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>All statuses</span>
          <span className="text-border">·</span>
          <span>Last 24h</span>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs hover:bg-elevated">
          <Download className="h-3 w-3" /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-surface/80 text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
            <tr className="border-b border-border">
              {["ID", "Resource", "Requester", "Score", "Price", "Status", "Time"].map((h, i) => (
                <th key={h} className={`px-3 py-2 font-medium ${i >= 3 ? "text-right" : "text-left"}`}>
                  <span className="inline-flex items-center gap-1 hover:text-foreground">
                    {h} <ArrowUpDown className="h-2.5 w-2.5 opacity-50" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-border/60">
                {Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} className="px-3 py-2.5"><Skeleton className="h-3.5 w-full" /></td>
                ))}
              </tr>
            ))}
            {!loading && !error && entries?.map((e) => (
              <tr key={e.id} className="border-b border-border/60 hover:bg-elevated/40">
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{e.id}</td>
                <td className="px-3 py-2.5 text-foreground">{e.resource}</td>
                <td className="px-3 py-2.5 text-foreground">{e.requester}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{e.score.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">€{e.matchedPrice.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right"><StatusBadge status={e.status} /></td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{e.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && (!entries || entries.length === 0) && (
        <div className="p-3"><EmptyState title="No ledger entries" description="Confirmed matches will appear here as they settle." /></div>
      )}
      {error && <div className="p-3"><ErrorState onRetry={onRetry} /></div>}
    </div>
  );
}
