import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { TrendChartCard } from "@/components/civicos/TrendChartCard";
import { MetricCard } from "@/components/civicos/MetricCard";
import { useMetrics, useExecuteMatching } from "@/lib/civicos/hooks";
import {
  ActivityFeed,
  AIRecommendation,
  ImpactScoreMeter,
  LiveMatchStatus,
} from "@/components/civicos/RightContextPanel";
import { Play, Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AddResourceDialog } from "@/components/civicos/AddResourceDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · CivicOS" },
      {
        name: "description",
        content:
          "CivicOS community operations center: monitor resource utilization, optimize allocations, and improve efficiency.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: m, isLoading } = useMetrics();
  const { mutate: runMatching, isPending: isRunning } = useExecuteMatching();
  const [addResourceOpen, setAddResourceOpen] = useState(false);

  const handleRunMatching = () => {
    runMatching(undefined, {
      onSuccess: (report) => {
        if (report.status === "empty") {
          toast.info("No matches found in this cycle.");
        } else {
          toast.success(`Matching complete: ${report.summary.totalMatchesFound} matches created.`);
        }
      },
      onError: (error) => {
        toast.error(`Matching failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      },
    });
  };

  return (
    <AppShell
      right={
        <div className="space-y-6">
          <ImpactScoreMeter value={m?.impactScore} loading={isLoading} />
          <AIRecommendation />
          <LiveMatchStatus />
          <ActivityFeed />
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Community Operations Center"
          subtitle="Monitor resource utilization, optimize allocations, and improve community efficiency."
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAddResourceOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-4 py-2 text-sm font-semibold transition-all hover:bg-elevated hover:border-primary/30"
              >
                <Plus className="h-4 w-4" /> Add Resource
              </button>
              <button
                onClick={handleRunMatching}
                disabled={isRunning}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                Run Matching
              </button>
            </div>
          }
        />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min">
          
          {/* Main Chart - Large Span */}
          <div className="md:col-span-3 lg:col-span-3 row-span-2">
            <TrendChartCard />
          </div>

          {/* Core Metrics Column */}
          <div className="space-y-4">
            <MetricCard
              label="Utilization Index"
              value={
                m?.utilizationIndex !== undefined ? Math.round(m.utilizationIndex * 100) : undefined
              }
              suffix="%"
              hint="Network load"
              loading={isLoading}
            />
            <MetricCard 
              label="Active Resources" 
              value={m?.activeResources} 
              hint="Available now"
              loading={isLoading} 
            />
          </div>

          {/* Secondary Metrics Row */}
          <div className="lg:col-span-1">
            <MetricCard 
              label="Matches Today" 
              value={m?.matchesToday} 
              delta={4.6} 
              size="sm"
              loading={isLoading} 
            />
          </div>
          <div className="lg:col-span-1">
            <MetricCard
              label="Demand Pressure"
              value={m?.demandPressure !== undefined ? Math.round(m.demandPressure * 100) : undefined}
              suffix="%"
              delta={-1.4}
              size="sm"
              loading={isLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <MetricCard
              label="Forecast Δ"
              prefix="₹"
              value={m?.forecastDelta}
              delta={-2.8}
              size="sm"
              loading={isLoading}
            />
          </div>
          <div className="lg:col-span-1">
             <MetricCard
              label="Est. Community Savings"
              prefix="₹"
              value={m?.estCommunitySavings}
              loading={isLoading}
              delta={2.1}
              size="sm"
            />
          </div>

          {/* Operational Insights */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="h-full rounded-2xl border border-border bg-card/20 p-6">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-foreground/90 uppercase tracking-widest flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                   Network Efficiency
                 </h3>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">P/L Impact</span>
                    <div className="text-xl font-bold text-primary mt-1">₹{m?.utilizationPL?.toLocaleString() ?? "0"}</div>
                    <div className="text-[10px] text-primary/60 mt-0.5">+3.2% vs last cycle</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">Net Impact</span>
                    <div className="text-xl font-bold text-foreground mt-1">₹{m?.netImpact?.toLocaleString() ?? "0"}</div>
                    <div className="text-[10px] text-muted-foreground/40 mt-0.5">+1.1% projected</div>
                  </div>
               </div>
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-2">
             <div className="h-full rounded-2xl border border-border bg-card/20 p-6 flex flex-col justify-center">
                <div className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                  Community resources are currently operating at <span className="text-foreground font-bold">{m?.utilizationIndex !== undefined ? Math.round(m.utilizationIndex * 100) : 0}%</span> capacity. 
                  Identify underutilized assets to improve collective impact.
                </div>
                <div className="mt-4 flex gap-3">
                   <button className="text-[11px] font-bold text-primary hover:underline">View Heatmap</button>
                   <button className="text-[11px] font-bold text-muted-foreground/60 hover:text-foreground transition-colors">Audit Logs</button>
                </div>
             </div>
          </div>

        </div>
      </div>

      <AddResourceDialog open={addResourceOpen} onOpenChange={setAddResourceOpen} />
    </AppShell>
  );
}
