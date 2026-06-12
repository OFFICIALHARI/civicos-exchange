import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { useRequests } from "@/lib/civicos/hooks";
import { RequestCard } from "@/components/civicos/RequestCard";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/civicos/EmptyState";

export const Route = createFileRoute("/requests")({
  head: () => ({ meta: [{ title: "Requests · CivicOS" }, { name: "description", content: "Incoming demand-side resource requests across communities." }] }),
  component: Requests,
});

function Requests() {
  const { data, isLoading, isError, refetch } = useRequests();
  return (
    <AppShell>
      <PageHeader title="Requests" subtitle="Demand signals awaiting allocation" />
      {isLoading && <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (!data || data.length === 0) && <EmptyState title="No active requests" />}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      )}
    </AppShell>
  );
}
