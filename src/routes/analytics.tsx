import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { Card, CardBody, CardHeader } from "@/components/civicos/Card";
import { MarketPulseChart } from "@/components/civicos/charts/MarketPulseChart";
import { HeatmapGrid } from "@/components/civicos/charts/HeatmapGrid";
import { MetricCard } from "@/components/civicos/MetricCard";
import { useMetrics, useTrend } from "@/lib/civicos/hooks";
import { ChartSkeleton } from "@/components/civicos/LoadingSkeletons";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · CivicOS" }, { name: "description", content: "Utilization, demand, and impact analytics for the community exchange." }] }),
  component: Analytics,
});

function Analytics() {
  const { data: util, isLoading: lu } = useTrend("1m");
  const { data: dem, isLoading: ld } = useTrend("1w");
  const { data: m, isLoading: lm } = useMetrics();

  return (
    <AppShell>
      <PageHeader title="Analytics" subtitle="Trends · forecasts · community impact" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Utilization Trend" subtitle="30-day rolling" />
          <CardBody><div className="h-[260px]">{lu || !util ? <ChartSkeleton className="h-full" /> : <MarketPulseChart data={util} />}</div></CardBody>
        </Card>
        <Card>
          <CardHeader title="Demand Trend" subtitle="7-day rolling" />
          <CardBody><div className="h-[260px]">{ld || !dem ? <ChartSkeleton className="h-full" /> : <MarketPulseChart data={dem} />}</div></CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="Demand Heatmap" subtitle="Hour × Day · this week" />
          <CardBody><HeatmapGrid rows={7} cols={24} /></CardBody>
        </Card>
        <div className="space-y-3">
          <MetricCard label="Community Savings" prefix="€" value={m?.estCommunitySavings} delta={4.6} loading={lm} />
          <MetricCard label="Impact Score" value={m?.impactScore !== undefined ? Math.round(m.impactScore * 100) : undefined} suffix="%" delta={1.2} loading={lm} />
          <MetricCard label="Predicted Next-Day Demand" value={m?.demandPressure !== undefined ? Math.round(m.demandPressure * 120) : undefined} suffix=" req" delta={3.4} loading={lm} />
        </div>
      </div>
    </AppShell>
  );
}
