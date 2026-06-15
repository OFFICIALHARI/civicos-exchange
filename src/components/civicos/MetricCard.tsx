import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./LoadingSkeletons";

export function MetricCard({
  label,
  value,
  delta,
  suffix,
  prefix,
  loading,
  size = "md",
  hint,
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
    <div className="group rounded-xl border border-border bg-card/40 p-5 transition-all duration-300 hover:bg-card/60 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground/80 transition-colors group-hover:text-muted-foreground">
          {label}
        </span>
        {delta !== undefined && !loading && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              delta >= 0 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "bg-destructive/10 text-destructive border border-destructive/20",
            )}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        {loading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          <div className={cn("font-bold tracking-tight tabular-nums text-foreground", valueClass)}>
            {prefix && <span className="mr-1 text-muted-foreground/60 font-medium">{prefix}</span>}
            {display}
            {suffix && (
              <span className="ml-1 text-sm font-medium text-muted-foreground/60">{suffix}</span>
            )}
          </div>
        )}
      </div>
      {hint && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          <div className="h-1 w-1 rounded-full bg-primary/40" />
          {hint}
        </div>
      )}
    </div>
  );
}
