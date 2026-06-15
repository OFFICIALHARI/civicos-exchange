import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { Card, CardBody, CardHeader } from "@/components/civicos/Card";
import { MarketPulseChart } from "@/components/civicos/charts/MarketPulseChart";
import { HeatmapGrid } from "@/components/civicos/charts/HeatmapGrid";
import { MetricCard } from "@/components/civicos/MetricCard";
import { useMetrics, useTrend } from "@/lib/civicos/hooks";
import { ChartSkeleton } from "@/components/civicos/LoadingSkeletons";
import { BarChart3, TrendingUp, Map, Users, Info } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Network Analytics · CivicOS" },
      {
        name: "description",
        content: "Utilization, demand, and impact analytics for the community exchange.",
      },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { data: util, isLoading: lu } = useTrend("1m");
  const { data: dem, isLoading: ld } = useTrend("1w");
  const { data: m, isLoading: lm } = useMetrics();

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="Network Analytics" 
          subtitle="Deep-dive into community resource utilization and demand dynamics." 
        />

        {/* Top Analytics Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader 
              title={
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Utilization Trajectory</span>
                </div>
              } 
              subtitle="30-day rolling network load" 
            />
            <CardBody>
              <div className="h-[280px]">
                {lu || !util ? (
                  <ChartSkeleton className="h-full" />
                ) : (
                  <MarketPulseChart data={util} />
                )}
              </div>
            </CardBody>
          </Card>

          <div className="space-y-6">
             <MetricCard
              label="Collective Savings"
              prefix="₹"
              value={m?.estCommunitySavings}
              delta={4.6}
              hint="Network economy"
              loading={lm}
            />
            <MetricCard
              label="Impact Score"
              value={m?.impactScore !== undefined ? Math.round(m.impactScore * 100) : undefined}
              suffix="%"
              delta={1.2}
              hint="Operational efficiency"
              loading={lm}
            />
            <div className="rounded-2xl border border-border bg-primary/5 p-5 border-primary/20">
               <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed">
                    Utilization is up <span className="text-primary font-bold">12%</span> this week due to increased EV charger sharing in the North Sector.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Lower Analytics Bento Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader 
              title={
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-amber-500/70" />
                  <span>Demand Heatmap</span>
                </div>
              }
              subtitle="Hourly demand distribution across active sectors" 
            />
            <CardBody>
              <div className="py-2">
                <HeatmapGrid rows={7} cols={24} />
              </div>
              <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <div className="h-2 w-2 rounded-sm bg-muted/20" /> Low
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="h-2 w-2 rounded-sm bg-primary/40" /> Medium
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="h-2 w-2 rounded-sm bg-primary" /> Peak
                    </div>
                 </div>
                 <span>Mon – Sun · 24 Hours</span>
              </div>
            </CardBody>
          </Card>

          <div className="space-y-6 lg:col-span-1">
             <Card className="h-full">
               <CardHeader 
                title="Predictive Signal" 
                subtitle="Next 24h forecast"
               />
               <CardBody className="flex flex-col justify-between h-[calc(100%-70px)]">
                  <div>
                    <div className="text-3xl font-bold text-foreground tracking-tight tabular-nums">
                      {m?.demandPressure !== undefined ? Math.round(m.demandPressure * 120) : "—"}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">Expected Requests</div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground/60">Confidence</span>
                        <span className="text-[11px] font-bold text-primary">88%</span>
                     </div>
                     <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[88%] rounded-full shadow-[0_0_8px_rgba(63,107,79,0.3)]" />
                     </div>
                  </div>

                  <div className="mt-8">
                     <button className="w-full py-2.5 rounded-xl border border-border bg-surface/50 text-[11px] font-bold text-foreground hover:bg-elevated hover:border-primary/30 transition-all active:scale-95">
                        Download Report
                     </button>
                  </div>
               </CardBody>
             </Card>
          </div>
        </div>
        
        {/* Network Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: "Active Nodes", value: "142", icon: BarChart3, trend: "+12" },
             { label: "Community Admins", value: "24", icon: Users, trend: "+2" },
             { label: "Avg. Match Time", value: "1.4s", icon: TrendingUp, trend: "-0.2s" },
             { label: "Network Uptime", value: "99.9%", icon: Info, trend: "Stable" },
           ].map((stat, i) => (
             <div key={i} className="rounded-2xl border border-border bg-card/20 p-5 hover:border-primary/20 transition-all group">
                <div className="flex items-center justify-between mb-3">
                   <div className="h-8 w-8 rounded-lg bg-surface/50 border border-border flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors">
                      <stat.icon className="h-4 w-4" />
                   </div>
                   <span className="text-[10px] font-bold text-primary/60">{stat.trend}</span>
                </div>
                <div className="text-xl font-bold text-foreground/90">{stat.value}</div>
                <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">{stat.label}</div>
             </div>
           ))}
        </div>

      </div>
    </AppShell>
  );
}
