import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { FilterBar } from "@/components/civicos/FilterBar";
import { ResourceCard } from "@/components/civicos/ResourceCard";
import { useResources } from "@/lib/civicos/hooks";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/civicos/EmptyState";

const CHIPS = ["All", "Parking", "EV Charger", "Solar", "Rooms"] as const;

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace · CivicOS" }, { name: "description", content: "Browse live community resources available for matching." }] }),
  component: Marketplace,
});

function Marketplace() {
  const [chip, setChip] = useState<string>("All");
  const { data, isLoading, isError, refetch } = useResources();
  return (
    <AppShell>
      <PageHeader title="Marketplace" subtitle="Live community resource listings" />
      <FilterBar chips={CHIPS} value={chip} onChange={setChip} placeholder="Search listings, owners, locations…" />

      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (!data || data.length === 0) && <EmptyState title="No listings yet" description="Listings will appear here as owners onboard resources." />}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}
    </AppShell>
  );
}
