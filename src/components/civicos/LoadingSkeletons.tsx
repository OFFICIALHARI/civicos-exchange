import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-md", className)} />;
}

export function MetricSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-64 w-full", className)} />;
}
