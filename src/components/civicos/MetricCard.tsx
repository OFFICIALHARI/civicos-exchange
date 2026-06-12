import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./LoadingSkeletons";

export function MetricCard({
  label, value, delta, suffix, prefix, loading, size = "md", hint,
}: {
  label: string;
  value?: number | string;
  delta?: number;
  suffix?: string;
  prefix?: string;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  hint?: string;
}) {
  const valueClass = size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-2xl";
  const display =
    value === undefined || value === null
      ? "—"
      : typeof value === "number"
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : value;

  return (
    <div className="rounded-xl border border-border bg-card/70 px-4 py-3.5 transition-colors hover:bg-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        {delta !== undefined && !loading && (
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
            delta >= 0 ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
          )}>
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(2)}%
          </span>
        )}
      </div>
      <div className="mt-2">
        {loading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <div className={cn("font-semibold tracking-tight tabular-nums", valueClass)}>
            {prefix && <span className="mr-0.5 text-muted-foreground">{prefix}</span>}
            {display}
            {suffix && <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>}
          </div>
        )}
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
