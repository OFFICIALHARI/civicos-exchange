import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { FilterBar } from "@/components/civicos/FilterBar";
import { ResourceCard } from "@/components/civicos/ResourceCard";
import { useResources } from "@/lib/civicos/hooks";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/civicos/EmptyState";
import { Store, ShoppingBag } from "lucide-react";

const CHIPS = ["All", "Parking", "EV Charger", "Solar", "Rooms"] as const;

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace · CivicOS" },
      { name: "description", content: "Browse live community resources available for matching." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const [chip, setChip] = useState<string>("All");
  const { data, isLoading, isError, refetch } = useResources();
  
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title="Community Marketplace" 
          subtitle="Explore available community assets and resource listings." 
        />
        
        <FilterBar
          chips={CHIPS}
          value={chip}
          onChange={setChip}
          placeholder="Search listings, owners, locations…"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl border border-border bg-card/20 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-12 flex justify-center">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-3xl bg-surface/10">
             <div className="h-16 w-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
             </div>
             <h3 className="text-lg font-bold text-foreground/80">No listings found</h3>
             <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs text-center">There are no active resource listings matching your criteria at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                 <Store className="h-6 w-6" />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-foreground/90">Onboard your community resources</h4>
                 <p className="text-xs text-muted-foreground/60 mt-0.5">Start sharing your surplus energy, space or equipment with your community.</p>
              </div>
           </div>
           <button className="whitespace-nowrap px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
              Add New Listing
           </button>
        </div>
      </div>
    </AppShell>
  );
}
