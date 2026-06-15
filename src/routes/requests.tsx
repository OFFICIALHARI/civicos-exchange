import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { useRequests } from "@/lib/civicos/hooks";
import { RequestCard } from "@/components/civicos/RequestCard";
import { Skeleton } from "@/components/civicos/LoadingSkeletons";
import { EmptyState, ErrorState } from "@/components/civicos/EmptyState";
import { Plus, Inbox, Search, Filter } from "lucide-react";
import { useState } from "react";
import { CreateRequestDialog } from "@/components/civicos/CreateRequestDialog";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Requests · CivicOS" },
      {
        name: "description",
        content: "Incoming demand-side resource requests across communities.",
      },
    ],
  }),
  component: Requests,
});

function Requests() {
  const { data, isLoading, isError, refetch } = useRequests();
  const [createRequestOpen, setCreateRequestOpen] = useState(false);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Demand Board"
          subtitle="Review and allocate resources to incoming community requests."
          actions={
            <div className="flex items-center gap-3">
              <button className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-elevated hover:text-foreground transition-all">
                <Filter className="h-3.5 w-3.5" /> Urgency
              </button>
              <button
                onClick={() => setCreateRequestOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" /> Create Request
              </button>
            </div>
          }
        />

        <div className="mt-8 mb-6 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
          <input 
            placeholder="Search active requests by community or resource type..."
            className="w-full bg-card/20 border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/40 focus:bg-card/40 transition-all"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl border border-border bg-card/20 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-12 flex justify-center">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="py-12 flex justify-center">
            <EmptyState 
              title="No active requests" 
              description="Community demand is currently fully met or awaiting signals."
              icon={Inbox}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        )}
      </div>

      <CreateRequestDialog open={createRequestOpen} onOpenChange={setCreateRequestOpen} />
    </AppShell>
  );
}
