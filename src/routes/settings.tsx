import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/civicos/AppShell";
import { Card, CardBody, CardHeader } from "@/components/civicos/Card";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = ["Profile", "Community", "Notifications", "Theme", "Permissions", "API"] as const;

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · CivicOS" },
      { name: "description", content: "Operator settings, permissions, and API connections." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Operator preferences and integrations" />

      <div className="mb-4 inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface/60 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs",
              tab === t
                ? "bg-card text-foreground ring-1 ring-primary/40"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={tab} subtitle="Configuration" />
        <CardBody className="space-y-4">
          {tab === "Profile" && (
            <>
              <Field label="Operator name" placeholder="Your name" />
              <Field label="Email" placeholder="you@example.org" />
              <Field label="Role" placeholder="Community operator" />
            </>
          )}
          {tab === "Community" && (
            <>
              <Field label="Default community" placeholder="Riverside" />
              <Field label="Timezone" placeholder="Asia/Kolkata" />
            </>
          )}
          {tab === "Notifications" && (
            <>
              <Toggle label="Critical demand alerts" />
              <Toggle label="Match confirmations" defaultChecked />
              <Toggle label="Weekly impact digest" defaultChecked />
            </>
          )}
          {tab === "Theme" && (
            <>
              <Field label="Theme" placeholder="Dark (default)" />
              <Field label="Accent" placeholder="Neon lime" />
            </>
          )}
          {tab === "Permissions" && (
            <div className="text-xs text-muted-foreground">
              Role-based access control will appear here once configured.
            </div>
          )}
          {tab === "API" && (
            <>
              <Field label="Webhook endpoint" placeholder="https://" />
              <Field label="API key" placeholder="••••••••" />
            </>
          )}
          <div className="flex justify-end">
            <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              Save
            </button>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  );
}

function Field({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <input
        placeholder={placeholder}
        className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
      />
    </label>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <label className="flex items-center justify-between rounded-md border border-border bg-surface/50 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          on ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all",
            on ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}
