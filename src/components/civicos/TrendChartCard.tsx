import { useState } from "react";
import { Card, CardBody, CardHeader } from "./Card";
import { TimeRangeTabs } from "./TimeRangeTabs";
import type { TimeRange } from "@/lib/civicos/types";
import { useTrend, useMetrics } from "@/lib/civicos/hooks";
import { MarketPulseChart } from "./charts/MarketPulseChart";
import { ChartSkeleton } from "./LoadingSkeletons";
import { EmptyState, ErrorState } from "./EmptyState";
import { ArrowUpRight, Plus, CreditCard, Camera } from "lucide-react";

export function TrendChartCard() {
  const [range, setRange] = useState<TimeRange>("6m");
  const { data, isLoading, isError, refetch } = useTrend(range);
  const { data: m } = useMetrics();

  return (
    <Card>
      <CardHeader
        className="border-b-0 pb-0"
        title={
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Community Resource Value</span>
            <span className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {m?.communityValue !== undefined ? `$${m.communityValue.toLocaleString()}` : "—"}
              </span>
              {m?.communityValueDeltaPct !== undefined && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                  <ArrowUpRight className="h-3 w-3" /> {m.communityValueDeltaPct.toFixed(1)}%
                </span>
              )}
            </span>
          </div>
        }
        action={
          <div className="flex items-center gap-1.5">
            <IconBtn><Plus className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn><CreditCard className="h-3.5 w-3.5" /></IconBtn>
            <IconBtn><Camera className="h-3.5 w-3.5" /></IconBtn>
          </div>
        }
      />
      <div className="flex items-center justify-end px-4 pb-2">
        <TimeRangeTabs value={range} onChange={setRange} />
      </div>
      <CardBody className="pt-0">
        <div className="h-[300px] w-full rounded-lg border border-border bg-background/40 p-2">
          {isLoading ? <ChartSkeleton className="h-full" />
            : isError ? <ErrorState onRetry={() => refetch()} />
            : !data || data.length === 0 ? <EmptyState title="No market activity" />
            : <MarketPulseChart data={data} />}
        </div>
      </CardBody>
    </Card>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:bg-elevated hover:text-foreground">
      {children}
    </button>
  );
}
