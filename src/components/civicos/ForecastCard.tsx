import type { Forecast } from "@/lib/civicos/types";
import { Sparkline } from "./charts/MarketPulseChart";
import { TrendingUp, Clock } from "lucide-react";

export function ForecastCard({ forecast }: { forecast: Forecast }) {
  const peak = forecast.series.reduce((a, b) => (b.value > a.value ? b : a), forecast.series[0]);
  return (
    <div className="group rounded-2xl border border-border bg-card/30 p-5 transition-all duration-300 hover:bg-card/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface/50 border border-border text-muted-foreground/40 group-hover:text-primary transition-colors">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Trend Projection
            </div>
            <div className="mt-0.5 text-sm font-bold text-foreground/90 group-hover:text-primary transition-colors">{forecast.label}</div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            <Clock className="h-2.5 w-2.5" /> Horizon
          </div>
          <div className="mt-0.5 text-[11px] font-bold text-foreground/70">{forecast.horizon}</div>
        </div>
      </div>
      
      <div className="mt-6 h-[64px] relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent rounded-b-xl" />
        <Sparkline data={forecast.series} />
      </div>

      <div className="mt-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <div className="h-1 w-1 rounded-full bg-primary" />
           <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Estimated Peak</span>
         </div>
         <span className="text-[11px] font-bold text-foreground/80 tabular-nums">{peak?.t ?? "—"}</span>
      </div>
    </div>
  );
}
