import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { useResources } from "@/lib/civicos/hooks";
import { StatusBadge } from "@/components/civicos/StatusBadge";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/civicos/EmptyState";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resources · CivicOS" }, { name: "description", content: "Manage your community's resources and availability." }] }),
  component: Resources,
});

function Resources() {
  const { data, isLoading, isError, refetch } = useResources();

  return (
    <AppShell>
      <PageHeader
        title="Resources"
        subtitle="Manage listings, availability, and pricing"
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Add Resource
          </button>
        }
      />

      <div className="rounded-xl border border-border bg-card/60">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface/80 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left font-medium">Resource</th>
                <th className="px-3 py-2 text-left font-medium">Kind</th>
                <th className="px-3 py-2 text-left font-medium">Owner</th>
                <th className="px-3 py-2 text-left font-medium">Availability</th>
                <th className="px-3 py-2 text-left font-medium">Utilization</th>
                <th className="px-3 py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">{Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-3 py-2.5"><Skeleton className="h-3.5 w-full" /></td>)}</tr>
              ))}
              {data?.map((r) => (
                <tr key={r.id} className="border-b border-border/60 hover:bg-elevated/40">
                  <td className="px-3 py-2.5 font-medium">{r.title}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.kind.replace("_", " ")}</td>
                  <td className="px-3 py-2.5">{r.owner}</td>
                  <td className="px-3 py-2.5 tabular-nums">{r.availability.start}–{r.availability.end}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${Math.round((r.utilization ?? 0) * 100)}%` }} />
                      </div>
                      <span className="tabular-nums">{Math.round((r.utilization ?? 0) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isError && <div className="p-3"><ErrorState onRetry={() => refetch()} /></div>}
        {!isLoading && !isError && (!data || data.length === 0) && <div className="p-3"><EmptyState /></div>}
      </div>
    </AppShell>
  );
}
