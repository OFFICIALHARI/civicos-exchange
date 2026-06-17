import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { useForecasts, useInsights } from "@/lib/civicos/hooks";
import { InsightCard } from "@/components/civicos/InsightCard";
import { ForecastCard } from "@/components/civicos/ForecastCard";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/civicos/EmptyState";
import { Sparkles, Send, BrainCircuit, LineChart } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights · CivicOS" },
      { name: "description", content: "Decision-support layer for marketplace optimization." },
    ],
  }),
  component: Insights,
});

function Insights() {
  const { data: insights, isLoading: li, isError: ei, refetch: ri } = useInsights();
  const { data: forecasts, isLoading: lf } = useForecasts();

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="Operational Intelligence" 
          subtitle="AI-driven optimizations, pricing adjustments, and predictive modeling." 
        />

        {/* AI Query Bar */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-center gap-4 rounded-2xl border border-primary/20 bg-card/40 p-3 backdrop-blur-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <input
              placeholder="Query the community engine: 'optimize resource pricing for tomorrow'..."
              className="h-12 flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">
              <Send className="h-4 w-4" /> Analyze
            </button>
          </div>
        </div>

        {/* Primary Insights */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <Sparkles className="h-4 w-4 text-primary" />
             <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-widest">Active Recommendations</h2>
          </div>
          
          {ei && <ErrorState onRetry={() => ri()} />}
          
          {li ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl border border-border bg-card/20 animate-pulse" />
              ))}
            </div>
          ) : !insights || insights.length === 0 ? (
            <EmptyState title="No active insights" description="The engine is currently gathering more data for new recommendations." />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {insights.map((i) => (
                <InsightCard key={i.id} insight={i} />
              ))}
            </div>
          )}
        </div>

        {/* Forecasts Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <LineChart className="h-4 w-4 text-primary" />
             <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-widest">Predictive Forecasts</h2>
          </div>

          {lf ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl border border-border bg-card/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {forecasts?.map((f) => (
                <ForecastCard key={f.id} forecast={f} />
              ))}
            </div>
          )}
        </div>

        {/* Contextual Note */}
        <div className="rounded-2xl border border-border bg-surface/30 p-6">
           <div className="flex items-start gap-4">
             <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
             <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed">
               All insights and forecasts are generated based on historical community usage patterns, 
               demand signals, and network efficiency metrics. Execute recommendations to improve collective 
               impact score.
             </p>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
