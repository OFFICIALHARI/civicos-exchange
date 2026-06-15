import { cn } from "@/lib/utils";
import type { TimeRange } from "@/lib/civicos/types";

const RANGES: TimeRange[] = ["1h", "8h", "1d", "1w", "1m", "6m", "1y"];

export function TimeRangeTabs({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (r: TimeRange) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface/60 p-1">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === r
              ? "bg-card text-foreground ring-1 ring-primary/40"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
