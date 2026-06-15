import type { Insight } from "@/lib/civicos/types";
import { Sparkles, TrendingUp, Tag, Activity, ArrowRight, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const KIND_ICON = {
  recommendation: BrainCircuit,
  pricing: Tag,
  utilization: Activity,
  forecast: TrendingUp,
} as const;

export function InsightCard({ insight }: { insight: Insight }) {
  const Icon = KIND_ICON[insight.kind];
  const confidence = Math.round(insight.confidence * 100);

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border bg-card/30 p-6 transition-all duration-300 hover:bg-card/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm transition-transform group-hover:scale-110">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
              {insight.kind}
            </span>
            <span className="text-[10px] font-bold text-primary/60">AI Intelligence</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Confidence</div>
          <div className={cn(
            "text-xs font-bold mt-1 px-2 py-0.5 rounded-full",
            confidence > 80 ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-500"
          )}>
            {confidence}%
          </div>
        </div>
      </div>

      <h3 className="mt-5 text-base font-bold text-foreground/90 tracking-tight leading-snug group-hover:text-primary transition-colors">
        {insight.title}
      </h3>
      <p className="mt-2 text-xs text-muted-foreground/70 leading-relaxed">
        {insight.summary}
      </p>

      <div className="mt-6 space-y-3 flex-1">
        {insight.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-surface/30 border border-border/40 hover:bg-surface/50 transition-colors">
            <div className="mt-1 h-1 w-1 rounded-full bg-primary shrink-0" />
            <span className="text-[11px] font-medium text-muted-foreground/80 leading-snug">{b}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border/40">
        <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]">
          Execute Recommendation <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
