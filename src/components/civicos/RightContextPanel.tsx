import { Card, CardHeader, CardBody } from "./Card";
import { useActivity, useInsights, useMatches } from "@/lib/civicos/hooks";
import { Skeleton } from "./LoadingSkeletons";
import { Sparkles, Activity as ActivityIcon, Radio, ArrowRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

export function ImpactScoreMeter({ value, loading }: { value?: number; loading?: boolean }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <Card>
      <CardHeader
        title="Impact Score"
        subtitle="Optimization index"
        action={
          <span className="text-[10px] font-medium text-muted-foreground/60">
            Real-time
          </span>
        }
      />
      <CardBody className="space-y-4">
        {loading ? (
          <Skeleton className="h-4 w-full rounded-full" />
        ) : (
          <>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/30">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary shadow-[0_0_12px_rgba(63,107,79,0.3)] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Efficiency</span>
                <span className="text-xl font-bold text-foreground">{pct}%</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Status</span>
                <span className={cn(
                  "text-[11px] font-bold px-2 py-0.5 rounded-full",
                  pct > 70 ? "text-primary bg-primary/10" : "text-amber-500 bg-amber-500/10"
                )}>
                  {pct > 70 ? "Optimized" : "Improving"}
                </span>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

export function LiveMatchStatus() {
  const { data, isLoading } = useMatches();
  return (
    <Card>
      <CardHeader
        title="Live Matches"
        action={
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Active
          </span>
        }
      />
      <CardBody className="space-y-2.5">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        {data?.slice(0, 4).map((m) => (
          <div
            key={m.id}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-surface/30 p-3 transition-all hover:bg-surface/50 hover:border-primary/20"
          >
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-foreground/90">{m.resourceTitle}</div>
              <div className="truncate text-[10px] text-muted-foreground/60 mt-0.5">
                {m.requesterName} · {Math.round(m.confidence * 100)}% Match
              </div>
            </div>
            <StatusBadge status={m.status} />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export function AIRecommendation() {
  const { data, isLoading } = useInsights();
  const top = data?.[0];
  return (
    <Card glow>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="font-semibold text-primary">AI Insight</span>
          </span>
        }
      />
      <CardBody>
        {isLoading || !top ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm font-bold text-foreground/90 leading-tight">{top.title}</div>
            <p className="mt-2 text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">{top.summary}</p>
            <div className="mt-4 flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
                Execute <ArrowRight className="h-3 w-3" />
              </button>
              <button className="flex-1 rounded-lg border border-border bg-surface/50 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-elevated hover:text-foreground transition-all">
                Dismiss
              </button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

export function ActivityFeed() {
  const { data, isLoading } = useActivity();
  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-muted-foreground/50" />
            <span>Audit Trail</span>
          </span>
        }
      />
      <CardBody className="space-y-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
        {data?.map((a) => (
          <div
            key={a.id}
            className="group flex items-start justify-between gap-3 border-l-2 border-border/30 pl-3 transition-colors hover:border-primary/40"
          >
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold text-foreground/90">{a.title}</div>
              <div className="truncate text-[10px] text-muted-foreground/60 mt-0.5">{a.meta}</div>
            </div>
            <div className="shrink-0 font-mono text-[9px] font-medium text-muted-foreground/40 mt-0.5">
              {a.timestamp}
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
