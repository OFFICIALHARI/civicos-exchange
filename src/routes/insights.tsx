import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { useForecasts, useInsights } from "@/lib/civicos/hooks";
import { InsightCard } from "@/components/civicos/InsightCard";
import { ForecastCard } from "@/components/civicos/ForecastCard";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/civicos/EmptyState";
import { Sparkles, Send } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "AI Insights · CivicOS" }, { name: "description", content: "Decision-support layer for marketplace optimization." }] }),
  component: Insights,
});

function Insights() {
  const { data: insights, isLoading: li, isError: ei, refetch: ri } = useInsights();
  const { data: forecasts, isLoading: lf } = useForecasts();

  return (
    <AppShell>
      <PageHeader title="AI Insights" subtitle="Optimization · pricing · forecasting" />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card/70 p-2">
        <Sparkles className="ml-1 h-4 w-4 text-primary" />
        <input
          placeholder="Ask the engine: 'where can I increase utilization tomorrow?'"
          className="h-9 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          <Send className="h-3 w-3" /> Ask
        </button>
      </div>

      {ei && <ErrorState onRetry={() => ri()} />}
      {li && <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>}
      {!li && !ei && (!insights || insights.length === 0) && <EmptyState title="No insights yet" />}
      {insights && insights.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((i) => <InsightCard key={i.id} insight={i} />)}
        </div>
      )}

      <h2 className="mt-6 mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Forecasts</h2>
      {lf && <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>}
      {forecasts && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {forecasts.map((f) => <ForecastCard key={f.id} forecast={f} />)}
        </div>
      )}
    </AppShell>
  );
}
