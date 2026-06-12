import { Bell, Search, Plus, Play, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <button className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-elevated">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Riverside Community
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      <div className="relative ml-1 hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search resources, requests, ledger…"
          className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-elevated px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" variant="outline" className="hidden h-9 gap-1.5 border-border bg-surface hover:bg-elevated sm:inline-flex">
          <Plus className="h-3.5 w-3.5" /> Add Resource
        </Button>
        <Button size="sm" className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Play className="h-3.5 w-3.5" /> Run Matching
        </Button>
        <button className="relative grid h-9 w-9 place-items-center rounded-md border border-border bg-surface hover:bg-elevated">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-2">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            MO
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline">Operator</span>
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
        </div>
      </div>
    </header>
  );
}
