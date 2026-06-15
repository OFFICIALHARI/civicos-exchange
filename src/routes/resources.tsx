import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { useResources } from "@/lib/civicos/hooks";
import { getResources } from "@/lib/api/resources.functions";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/civicos/EmptyState";
import { Plus, SlidersHorizontal, Search } from "lucide-react";
import { useState } from "react";
import { AddResourceDialog } from "@/components/civicos/AddResourceDialog";
import { ResourceCard } from "@/components/civicos/ResourceCard";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources · CivicOS" },
      { name: "description", content: "Manage your community's resources and availability." },
    ],
  }),
  loader: async () => {
    return await getResources();
  },
  component: Resources,
});

function Resources() {
  const { data, isLoading, isError, refetch } = useResources();
  const [addResourceOpen, setAddResourceOpen] = useState(false);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Community Resources"
          subtitle="Monitor and manage collective assets, space, and equipment."
          actions={
            <div className="flex items-center gap-3">
              <button className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-elevated hover:text-foreground transition-all">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </button>
              <button
                onClick={() => setAddResourceOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" /> Add Resource
              </button>
            </div>
          }
        />

        <div className="mt-8 mb-6 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
          <input 
            placeholder="Search resources by name, type, or owner..."
            className="w-full bg-card/20 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/40 focus:bg-card/40 transition-all"
          />
        </div>

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
          <div className="py-12 flex justify-center">
            <EmptyState title="No resources found" subtitle="Start by adding your community's first shared resource." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </div>

      <AddResourceDialog open={addResourceOpen} onOpenChange={setAddResourceOpen} />
    </AppShell>
  );
}
