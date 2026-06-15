import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { LedgerTable } from "@/components/civicos/LedgerTable";
import { useLedger } from "@/lib/civicos/hooks";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "Ledger · CivicOS" },
      { name: "description", content: "Settled transactions across the resource exchange." },
    ],
  }),
  component: Ledger,
});

function Ledger() {
  const { data, isLoading, isError, refetch } = useLedger();
  return (
    <AppShell>
      <PageHeader title="Transaction Ledger" subtitle="Settled matches · auditable record" />
      <LedgerTable entries={data} loading={isLoading} error={isError} onRetry={() => refetch()} />
    </AppShell>
  );
}
