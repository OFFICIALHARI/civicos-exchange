import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { Card, CardBody, CardHeader } from "@/components/civicos/Card";
import { useMatches, useRequests, useResources, useExecuteMatching } from "@/lib/civicos/hooks";
import { MatchCard } from "@/components/civicos/MatchCard";
import { StatusBadge, UrgencyBadge } from "@/components/civicos/StatusBadge";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { Activity, Play, Loader2, ArrowRight, Boxes, Inbox, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/matching")({
  head: () => ({
    meta: [
      { title: "Matching Engine · CivicOS" },
      {
        name: "description",
        content: "Real-time supply/demand matching engine for community resources.",
      },
    ],
  }),
  component: Matching,
});

function Matching() {
  const { data: resources, isLoading: lr } = useResources();
  const { data: requests, isLoading: lq } = useRequests();
  const { data: matches, isLoading: lm } = useMatches();
  const { mutate: runMatching, isPending: isRunning } = useExecuteMatching();

  const handleRunMatching = () => {
    runMatching(undefined, {
      onSuccess: (report) => {
        if (report.status === "empty") {
          toast.info("No matches found in this cycle.");
        } else {
          toast.success(
            `Matching cycle complete: ${report.summary.totalMatchesFound} matches created.`,
          );
        }
      },
      onError: (error) => {
        toast.error(`Matching failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      },
    });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Matching Engine"
          subtitle="Real-time optimization of community supply and demand signals."
          actions={
            <button
              onClick={handleRunMatching}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              Execute Cycle
            </button>
          }
        />

        {/* Pipeline Visualization */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Supply Column */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2 px-1">
               <Boxes className="h-4 w-4 text-primary" />
               <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Available Supply</span>
               <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">{resources?.length ?? 0} items</span>
             </div>
             <div className="space-y-3">
                {lr && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                {resources?.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-card/20 p-3 transition-all hover:border-primary/20"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-foreground/90">{r.title}</div>
                      <div className="truncate text-[10px] text-muted-foreground/60 mt-0.5">{r.kind.replace('_', ' ')}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
                <button className="w-full py-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest hover:text-primary transition-colors">View all supply</button>
             </div>
          </div>

          {/* Engine Column */}
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-2">
               <Sparkles className="h-4 w-4 text-primary" />
               <span className="text-xs font-bold text-primary uppercase tracking-widest">Match Engine</span>
            </div>
            <Card glow className="relative z-10 border-primary/30 bg-primary/5">
              <CardBody className="flex flex-col items-center py-10">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                  <div className="relative h-24 w-24 rounded-full border-2 border-primary/30 flex items-center justify-center bg-card/40 backdrop-blur-xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground tabular-nums">
                        {matches?.length ?? 0}
                      </div>
                      <div className="text-[9px] font-bold text-primary uppercase tracking-widest">Active</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                   <div className="bg-background/40 rounded-xl p-3 border border-border/50 text-center">
                      <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter mb-1">Efficiency</div>
                      <div className="text-sm font-bold text-foreground">94.2%</div>
                   </div>
                   <div className="bg-background/40 rounded-xl p-3 border border-border/50 text-center">
                      <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter mb-1">Latency</div>
                      <div className="text-sm font-bold text-foreground">12ms</div>
                   </div>
                </div>

                <div className="mt-6 flex flex-col items-center gap-2">
                   <div className="flex -space-x-2">
                      {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="h-6 w-6 rounded-full border-2 border-card bg-muted animate-pulse" />
                      ))}
                   </div>
                   <span className="text-[10px] font-medium text-muted-foreground/60 italic">Resolving community demand...</span>
                </div>
              </CardBody>
            </Card>
            
            {/* Connection Lines (Visual only) */}
            <div className="hidden lg:block absolute top-1/2 -left-8 w-8 h-px bg-gradient-to-r from-transparent to-primary/30" />
            <div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-px bg-gradient-to-l from-transparent to-primary/30" />
          </div>

          {/* Demand Column */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2 px-1">
               <Inbox className="h-4 w-4 text-amber-500/70" />
               <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Active Demand</span>
               <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">{requests?.length ?? 0} signals</span>
             </div>
             <div className="space-y-3">
                {lq && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                {requests?.slice(0, 5).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-card/20 p-3 transition-all hover:border-amber-500/20"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-foreground/90">{q.requester}</div>
                      <div className="truncate text-[10px] text-muted-foreground/60 mt-0.5">{q.location}</div>
                    </div>
                    <UrgencyBadge urgency={q.urgency} />
                  </div>
                ))}
                <button className="w-full py-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest hover:text-amber-500 transition-colors">View all demand</button>
             </div>
          </div>

        </div>

        {/* Results Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-foreground/90 uppercase tracking-[0.2em] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Proposed Optimizations
            </h2>
            <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
              Showing {matches?.length ?? 0} potential allocations
            </div>
          </div>
          
          {lm && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl border border-border bg-card/20 animate-pulse" />
              ))}
            </div>
          )}
          
          {matches && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
