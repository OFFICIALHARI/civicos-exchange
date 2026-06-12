import { cn } from "@/lib/utils";

export function HeatmapGrid({
  rows = 7, cols = 24, intensity,
}: { rows?: number; cols?: number; intensity?: (r: number, c: number) => number }) {
  const fn = intensity ?? ((r, c) => (Math.sin(r + c / 3) + 1) / 2);
  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const v = Math.min(1, Math.max(0, fn(r, c)));
        return (
          <div
            key={i}
            className={cn("aspect-square rounded-[2px]")}
            style={{
              background: `color-mix(in oklab, oklch(0.92 0.20 122) ${Math.round(v * 80)}%, oklch(0.22 0 0))`,
            }}
            title={`r${r} c${c}: ${v.toFixed(2)}`}
          />
        );
      })}
    </div>
  );
}
