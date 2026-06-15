import { Bell, Search, Plus, Play, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddResourceDialog } from "./AddResourceDialog";
import { useExecuteMatching } from "@/lib/civicos/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TopBar() {
  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const { mutate: runMatching, isPending: isRunning } = useExecuteMatching();

  const handleRunMatching = () => {
    runMatching(undefined, {
      onSuccess: (report) => {
        if (report.status === "empty") {
          toast.info("No matches found in this cycle.");
        } else {
          toast.success(`Matching complete: ${report.summary.totalMatchesFound} matches created.`);
        }
      },
      onError: (error) => {
        toast.error(`Matching failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      },
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/60 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button className="group flex items-center gap-2.5 rounded-lg border border-border bg-surface/50 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-elevated hover:border-primary/30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
          Bengaluru Civic Plaza
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:rotate-180" />
        </button>
      </div>

      <div className="relative hidden flex-1 max-w-md lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <input
          placeholder="Search community resources..."
          className="h-10 w-full rounded-xl border border-border bg-surface/30 pl-10 pr-16 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:bg-surface/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">
            ⌘
          </kbd>
          <kbd className="rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">
            K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden h-8 w-[1px] bg-border mx-2 sm:block" />
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAddResourceOpen(true)}
          className="hidden h-9 gap-2 border-border bg-surface/50 font-medium hover:bg-elevated hover:border-primary/30 sm:inline-flex"
        >
          <Plus className="h-4 w-4" /> Add Resource
        </Button>
        
        <Button
          size="sm"
          onClick={handleRunMatching}
          disabled={isRunning}
          className="h-9 gap-2 bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          Run Matching
        </Button>

        <button className="relative group grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/50 transition-all hover:bg-elevated hover:border-primary/30">
          <Bell className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary border-2 border-surface" />
        </button>

        <div className="flex h-9 items-center gap-2.5 rounded-lg border border-border bg-surface/50 pl-2 pr-2.5 transition-all hover:bg-elevated hover:border-primary/30">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-[10px] font-bold text-primary border border-primary/20">
            MO
          </div>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-[10px] font-semibold leading-none text-foreground">Operator</span>
            <span className="text-[9px] leading-none text-muted-foreground">Active now</span>
          </div>
        </div>
      </div>

      <AddResourceDialog open={addResourceOpen} onOpenChange={setAddResourceOpen} />
    </header>
  );
}
