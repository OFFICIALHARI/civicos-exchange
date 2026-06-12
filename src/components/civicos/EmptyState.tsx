import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title = "Nothing here yet",
  description = "Data will appear once the engine receives signals.",
  icon: Icon = Inbox,
  action,
}: {
  title?: string;
  description?: string;
  icon?: typeof Inbox;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface/40 px-6 py-10 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-md border border-border bg-card text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</div>
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <div className="text-sm font-medium text-destructive">Failed to load</div>
      <div className="max-w-sm text-xs text-muted-foreground">The data layer is unreachable. Retry, or check the upstream service.</div>
      {onRetry && (
        <button onClick={onRetry} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-elevated">
          Retry
        </button>
      )}
    </div>
  );
}
