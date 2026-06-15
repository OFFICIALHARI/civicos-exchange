import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterBar({
  chips,
  value,
  onChange,
  placeholder = "Filter…",
}: {
  chips: readonly string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
        <input
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-border bg-card/20 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 transition-all focus:bg-card/40 focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface/30 rounded-xl border border-border/50">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all",
              value === c
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/20 px-4 text-xs font-bold text-foreground transition-all hover:bg-elevated hover:border-primary/30">
        <SlidersHorizontal className="h-4 w-4" /> 
        Sort By
        <ChevronDown className="h-3.5 w-3.5 opacity-40" />
      </button>
    </div>
  );
}
