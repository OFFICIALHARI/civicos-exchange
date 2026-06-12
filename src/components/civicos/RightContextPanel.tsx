import { Card, CardHeader, CardBody } from "./Card";
import { useActivity, useInsights, useMatches } from "@/lib/civicos/hooks";
import { Skeleton } from "./LoadingSkeletons";
import { Sparkles, Activity as ActivityIcon, Radio } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export function ImpactScoreMeter({ value, loading }: { value?: number; loading?: boolean }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <Card>
      <CardHeader
        title="Impact Score"
        subtitle="Community resource optimization"
        action={<span className="text-[10px] uppercase tracking-wider text-muted-foreground">Updated · just now</span>}
      />
      <CardBody className="space-y-3">
        {loading ? <Skeleton className="h-3 w-full" /> : (
          <>
            <div className="relative h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary shadow-[0_0_18px_rgba(220,255,0,0.5)]"
                style={{ width: `${pct}%` }}
              />
              <div
                aria-hidden
                className="absolute inset-y-0 right-0 bg-[repeating-linear-gradient(90deg,oklch(0.27_0_0)_0_2px,transparent_2px_5px)]"
                style={{ left: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Low Impact</span>
              <span className="tabular-nums text-foreground">{pct}</span>
              <span>High Impact</span>
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
        title="Live Match Status"
        action={<span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary"><Radio className="h-3 w-3 animate-pulse" /> live</span>}
      />
      <CardBody className="space-y-2">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        {data?.slice(0, 4).map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-surface/50 px-2.5 py-1.5">
            <div className="min-w-0">
              <div className="truncate text-xs">{m.resourceTitle}</div>
              <div className="truncate text-[10px] text-muted-foreground">{m.requesterName} · {Math.round(m.confidence * 100)}</div>
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
      <CardHeader title={<span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> AI Recommendation</span>} />
      <CardBody>
        {isLoading || !top ? (
          <div className="space-y-2"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /></div>
        ) : (
          <>
            <div className="text-sm font-medium">{top.title}</div>
            <p className="mt-1 text-xs text-muted-foreground">{top.summary}</p>
            <div className="mt-3 flex items-center gap-2">
              <button className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">Apply</button>
              <button className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs hover:bg-elevated">Dismiss</button>
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
      <CardHeader title={<span className="flex items-center gap-1.5"><ActivityIcon className="h-3.5 w-3.5" /> Recent Activity</span>} />
      <CardBody className="space-y-2.5">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
        {data?.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-2 border-b border-border/40 pb-2 last:border-0">
            <div className="min-w-0">
              <div className="truncate text-xs text-foreground">{a.title}</div>
              <div className="truncate text-[10px] text-muted-foreground">{a.meta}</div>
            </div>
            <div className="shrink-0 font-mono text-[10px] text-muted-foreground">{a.timestamp}</div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
