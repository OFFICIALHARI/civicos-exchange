import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { Card, CardBody, CardHeader } from "@/components/civicos/Card";
import { useMatches, useRequests, useResources, useExecuteMatching } from "@/lib/civicos/hooks";
import { MatchCard } from "@/components/civicos/MatchCard";
import { StatusBadge, UrgencyBadge } from "@/components/civicos/StatusBadge";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { Activity, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/matching")({
  head: () => ({ meta: [{ title: "Live Matching · CivicOS" }, { name: "description", content: "Real-time supply/demand matching engine for community resources." }] }),
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
          toast.success(`Matching cycle complete: ${report.summary.totalMatchesFound} matches created.`);
        }
      },
      onError: (error) => {
        toast.error(`Matching failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Live Matching"
        subtitle="Supply ↔ Engine ↔ Demand"
        actions={
          <button 
            onClick={handleRunMatching}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run Cycle
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px_1fr]">
        <Card>
          <CardHeader title="Supply" subtitle={`${resources?.length ?? 0} resources`} />
          <CardBody className="space-y-2">
            {lr && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            {resources?.slice(0, 6).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-border/60 bg-surface/50 px-2.5 py-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{r.title}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{r.community}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card glow>
          <CardHeader title={<span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary" /> Engine</span>} subtitle="Optimization cycle" />
          <CardBody>
            <div className="relative h-40 overflow-hidden rounded-lg border border-border bg-background/60">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 h-px bg-primary/50"
                  style={{ top: `${15 + i * 15}%`, animation: `pulse-line 1.6s ease-in-out ${i * 0.15}s infinite` }}
                />
              ))}
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-primary">matching</div>
                  <div className="mt-1 text-3xl font-semibold tabular-nums">{matches?.length ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground">pairs evaluated</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
              <div className="rounded-md border border-border bg-surface py-1.5"><div className="text-sm text-foreground tabular-nums">{matches?.filter(m => m.status === "matched").length ?? 0}</div>matched</div>
              <div className="rounded-md border border-border bg-surface py-1.5"><div className="text-sm text-warning tabular-nums">{matches?.filter(m => m.status === "pending").length ?? 0}</div>pending</div>
              <div className="rounded-md border border-border bg-surface py-1.5"><div className="text-sm text-success tabular-nums">{matches?.filter(m => m.status === "confirmed").length ?? 0}</div>confirmed</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Demand" subtitle={`${requests?.length ?? 0} requests`} />
          <CardBody className="space-y-2">
            {lq && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            {requests?.slice(0, 6).map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-md border border-border/60 bg-surface/50 px-2.5 py-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{q.requester}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{q.location} · {q.window.start}–{q.window.end}</div>
                </div>
                <UrgencyBadge urgency={q.urgency} />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Recent Matches</h2>
        {lm && <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>}
        {matches && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
