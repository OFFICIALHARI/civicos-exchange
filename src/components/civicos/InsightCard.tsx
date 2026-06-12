import type { Insight } from "@/lib/civicos/types";
import { Sparkles, TrendingUp, Tag, Activity, Check } from "lucide-react";

const KIND_ICON = {
  recommendation: Sparkles,
  pricing: Tag,
  utilization: Activity,
  forecast: TrendingUp,
} as const;

export function InsightCard({ insight }: { insight: Insight }) {
  const Icon = KIND_ICON[insight.kind];
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{insight.kind}</span>
        </div>
        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
          conf {Math.round(insight.confidence * 100)}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{insight.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{insight.summary}</p>
      <ul className="mt-3 space-y-1.5">
        {insight.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4">
        <button className="w-full rounded-md border border-border bg-surface py-1.5 text-xs hover:border-primary/40 hover:bg-elevated hover:text-primary">
          Apply suggestion
        </button>
      </div>
    </div>
  );
}
