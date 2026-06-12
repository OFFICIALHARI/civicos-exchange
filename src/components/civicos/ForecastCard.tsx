import type { Forecast } from "@/lib/civicos/types";
import { Sparkline } from "./charts/MarketPulseChart";

export function ForecastCard({ forecast }: { forecast: Forecast }) {
  const peak = forecast.series.reduce((a, b) => (b.value > a.value ? b : a), forecast.series[0]);
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Forecast</div>
          <div className="mt-0.5 text-sm font-semibold">{forecast.label}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{forecast.horizon}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-muted-foreground">peak</div>
          <div className="font-mono text-sm">{peak?.t ?? "—"}</div>
        </div>
      </div>
      <div className="mt-3 h-[58px]">
        <Sparkline data={forecast.series} />
      </div>
    </div>
  );
}
