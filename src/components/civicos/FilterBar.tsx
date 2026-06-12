import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterBar({
  chips, value, onChange, placeholder = "Filter…",
}: {
  chips: readonly string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder={placeholder}
          className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs transition-colors",
              value === c
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-surface text-muted-foreground hover:bg-elevated hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-xs hover:bg-elevated">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Sort
      </button>
    </div>
  );
}
