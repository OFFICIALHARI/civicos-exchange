import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { TrendChartCard } from "@/components/civicos/TrendChartCard";
import { MetricCard } from "@/components/civicos/MetricCard";
import { useMetrics } from "@/lib/civicos/hooks";
import { ActivityFeed, AIRecommendation, ImpactScoreMeter, LiveMatchStatus } from "@/components/civicos/RightContextPanel";
import { Play, Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · CivicOS" },
      { name: "description", content: "CivicOS resource exchange command center: live utilization, matching, and impact." },
      { property: "og:title", content: "CivicOS — Resource Exchange Command Center" },
      { property: "og:description", content: "Live community resource utilization, market-style matching, and AI-assisted decision support." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: m, isLoading } = useMetrics();

  return (
    <AppShell
      right={
        <div className="space-y-4">
          <ImpactScoreMeter value={m?.impactScore} loading={isLoading} />
          <LiveMatchStatus />
          <AIRecommendation />
          <ActivityFeed />
        </div>
      }
    >
      <PageHeader
        title="Resource Exchange"
        subtitle="Live utilization · matching · community impact"
        actions={
          <>
            <button className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:bg-elevated">
              <Plus className="h-3.5 w-3.5" /> Add Resource
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              <Play className="h-3.5 w-3.5" /> Run Matching
            </button>
          </>
        }
      />

      <TrendChartCard />

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Utilization Index" value={m?.utilizationIndex !== undefined ? Math.round(m.utilizationIndex * 100) : undefined} suffix="%" loading={isLoading} />
        <MetricCard label="Active Resources" value={m?.activeResources} loading={isLoading} />
        <MetricCard label="Matches Today" value={m?.matchesToday} loading={isLoading} delta={4.6} />
        <MetricCard label="Est. Community Savings" prefix="€" value={m?.estCommunitySavings} loading={isLoading} delta={2.1} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Utilization P/L" prefix="€" value={m?.utilizationPL} delta={3.2} size="sm" loading={isLoading} />
        <MetricCard label="Demand Pressure" value={m?.demandPressure !== undefined ? Math.round(m.demandPressure * 100) : undefined} suffix="%" delta={-1.4} size="sm" loading={isLoading} />
        <MetricCard label="Forecast Δ" prefix="€" value={m?.forecastDelta} delta={-2.8} size="sm" loading={isLoading} />
        <MetricCard label="Net Impact" prefix="€" value={m?.netImpact} delta={1.1} size="sm" loading={isLoading} />
      </div>
    </AppShell>
  );
}
