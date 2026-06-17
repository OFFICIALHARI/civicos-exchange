import type { LedgerEntry } from "@/lib/civicos/types";
import { StatusBadge } from "./StatusBadge";
import { ArrowUpDown, Download, Filter, Search, History } from "lucide-react";
import { Skeleton } from "./LoadingSkeletons";
import { EmptyState, ErrorState } from "./EmptyState";
import { formatCurrencyCompact } from "@/lib/civicos/currency";
import { cn } from "@/lib/utils";

export function LedgerTable({
  entries,
  loading,
  error,
  onRetry,
}: {
  entries?: LedgerEntry[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/20 overflow-hidden backdrop-blur-sm shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-4 bg-surface/30">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
            <input 
              placeholder="Filter by ID or resource..."
              className="bg-background/40 border border-border/60 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-primary/40 transition-all w-64"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest border-l border-border/60 pl-4">
            <Filter className="h-3 w-3" />
            <span>All Entities</span>
            <span className="text-border">/</span>
            <span>Q2 2026</span>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-elevated hover:border-primary/30">
          <Download className="h-3.5 w-3.5" /> Export Audit Log
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-surface/50 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border/40">
            <tr>
              <th className="px-6 py-4 text-left font-bold">Transaction Trace</th>
              <th className="px-6 py-4 text-left font-bold">Involved Parties</th>
              <th className="px-6 py-4 text-right font-bold">Match Score</th>
              <th className="px-6 py-4 text-right font-bold">Value</th>
              <th className="px-6 py-4 text-right font-bold">Status</th>
              <th className="px-6 py-4 text-right font-bold">Settled At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-6 py-5">
                      <Skeleton className="h-4 w-full rounded-md" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              !error &&
              entries?.map((e) => (
                <tr key={e.id} className="group hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface/50 border border-border group-hover:border-primary/30 transition-all text-muted-foreground/40 group-hover:text-primary">
                        <History className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground/90">{e.resource}</span>
                        <span className="font-mono text-[9px] text-muted-foreground/40 mt-0.5">{e.id.toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="h-5 w-5 rounded-md bg-secondary/20 border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground/60 uppercase">
                          {e.requester.charAt(0)}
                       </div>
                       <span className="font-medium text-foreground/80">{e.requester}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right tabular-nums">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold">
                       {Math.round(e.score * 100)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right tabular-nums font-bold text-foreground/90">
                    {formatCurrencyCompact(e.matchedPrice)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-6 py-5 text-right text-muted-foreground/60 font-medium">{e.timestamp}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && (!entries || entries.length === 0) && (
        <div className="py-20 flex justify-center bg-surface/10">
          <EmptyState
            title="No records found"
            description="Confirmed allocations will appear in this audit trail once settled."
          />
        </div>
      )}
      {error && (
        <div className="py-12 flex justify-center">
          <ErrorState onRetry={onRetry} />
        </div>
      )}
    </div>
  );
}
