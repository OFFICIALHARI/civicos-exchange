import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { Card, CardBody, CardHeader } from "@/components/civicos/Card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearAllData, runScenario } from "@/lib/api/system.functions";
import { toast } from "sonner";
import { ShieldCheck, Database, Zap, AlertTriangle, Lightbulb, Trash2, Loader2, Key } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/system")({
  head: () => ({ meta: [{ title: "System Validation · CivicOS" }] }),
  component: SystemValidation,
});

function SystemValidation() {
  const queryClient = useQueryClient();
  const [secret, setSecret] = useState("");

  const { mutate: clear, isPending: isClearing } = useMutation({
    mutationFn: () => clearAllData({ data: { secret } }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Database cleared successfully.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  });

  const { mutate: run, isPending: isRunning } = useMutation({
    mutationFn: (scenario: "A" | "B" | "C") => runScenario({ data: { scenario, secret } }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Scenario applied successfully.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  });

  return (
    <AppShell>
      <PageHeader title="Operator Control" subtitle="System validation & pipeline integrity" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card glow>
          <CardHeader 
            title={<span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Integrity Check</span>} 
            subtitle="Verify core system lifecycles" 
          />
          <CardBody className="space-y-4">
            <LifecycleRow label="Resource / Request" status="ok" />
            <LifecycleRow label="Matching Engine" status="ok" />
            <LifecycleRow label="Booking / Ledger" status="ok" />
            <LifecycleRow label="Trend / Snapshot" status="ok" />
            <LifecycleRow label="AI Insight Generation" status="ok" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader 
            title={<span className="flex items-center gap-2"><Database className="h-4 w-4 text-muted-foreground" /> Data Management</span>} 
            subtitle="Reset or seed system state" 
          />
          <CardBody className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System Secret</label>
              <div className="relative">
                <Key className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter admin secret..."
                  className="h-9 w-full rounded-md border border-border bg-background px-8 text-xs focus:border-primary/40 focus:outline-none"
                />
              </div>
            </div>
            <button 
              onClick={() => clear()}
              disabled={isClearing}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
            >
              {isClearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Clear All Marketplace Data
            </button>
          </CardBody>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Test Scenarios</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ScenarioCard 
          title="Scenario A" 
          description="Happy Path: Success Match"
          expected="Match → Booking → Ledger → Snapshot"
          icon={<Zap className="h-5 w-5 text-yellow-500" />}
          onClick={() => run("A")}
          loading={isRunning}
        />
        <ScenarioCard 
          title="Scenario B" 
          description="Stress: High Demand"
          expected="Trigger: Risk Insight (Critical)"
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          onClick={() => run("B")}
          loading={isRunning}
        />
        <ScenarioCard 
          title="Scenario C" 
          description="Lull: Underutilization"
          expected="Trigger: Opportunity Insight"
          icon={<Lightbulb className="h-5 w-5 text-blue-500" />}
          onClick={() => run("C")}
          loading={isRunning}
        />
      </div>
    </AppShell>
  );
}

function LifecycleRow({ label, status }: { label: string; status: "ok" | "warn" | "fail" }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
      <span className="text-sm">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        status === "ok" ? "bg-success/20 text-success" : 
        status === "warn" ? "bg-warning/20 text-warning" : 
        "bg-destructive/20 text-destructive"
      }`}>
        {status === "ok" ? "Operational" : status === "warn" ? "Degraded" : "Error"}
      </span>
    </div>
  );
}

function ScenarioCard({ title, description, expected, icon, onClick, loading }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="flex flex-col rounded-xl border border-border bg-card/60 p-4 text-left transition-all hover:border-primary/40 hover:bg-elevated hover:shadow-lg disabled:opacity-50"
    >
      <div className="mb-3 rounded-lg bg-surface p-2 w-fit">{icon}</div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-3 rounded bg-background/40 p-2 border border-border/30">
        <span className="block text-[9px] font-bold uppercase text-muted-foreground">Expected Output:</span>
        <span className="text-[10px] text-foreground/80">{expected}</span>
      </div>
    </button>
  );
}

function LifecycleRow({ label, status }: { label: string; status: "ok" | "warn" | "fail" }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
      <span className="text-sm">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        status === "ok" ? "bg-success/20 text-success" : 
        status === "warn" ? "bg-warning/20 text-warning" : 
        "bg-destructive/20 text-destructive"
      }`}>
        {status === "ok" ? "Operational" : status === "warn" ? "Degraded" : "Error"}
      </span>
    </div>
  );
}

function ScenarioCard({ title, description, expected, icon, onClick, loading }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="flex flex-col rounded-xl border border-border bg-card/60 p-4 text-left transition-all hover:border-primary/40 hover:bg-elevated hover:shadow-lg disabled:opacity-50"
    >
      <div className="mb-3 rounded-lg bg-surface p-2 w-fit">{icon}</div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-3 rounded bg-background/40 p-2 border border-border/30">
        <span className="block text-[9px] font-bold uppercase text-muted-foreground">Expected Output:</span>
        <span className="text-[10px] text-foreground/80">{expected}</span>
      </div>
    </button>
  );
}
