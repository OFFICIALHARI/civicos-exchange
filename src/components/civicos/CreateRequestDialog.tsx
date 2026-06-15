import { useState } from "react";
import { useCreateRequest, DEFAULT_USER_ID } from "@/lib/civicos/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CreateRequestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: createRequest, isPending } = useCreateRequest();
  const [formData, setFormData] = useState({
    resourceType: "ev" as "ev" | "parking" | "solar" | "room",
    location: "Civic Plaza",
    maxPrice: 2000,
    priority: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest(
      {
        ...formData,
        userId: DEFAULT_USER_ID,
        timeWindow: {
          start: new Date(),
          end: new Date(Date.now() + 4 * 3600000),
        },
        status: "pending",
      },
      {
        onSuccess: () => {
          toast.success("Request created successfully!");
          onOpenChange(false);
          setFormData({
            resourceType: "ev",
            location: "Civic Plaza",
            maxPrice: 2000,
            priority: 5,
          });
        },
        onError: (error) => {
          toast.error(
            `Failed to create request: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Request</DialogTitle>
            <DialogDescription>Submit a demand signal for community resources.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resourceType">Resource Type</Label>
              <Select
                value={formData.resourceType}
                onValueChange={(v: "ev" | "parking" | "solar" | "room") =>
                  setFormData({ ...formData, resourceType: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ev">EV Charger</SelectItem>
                  <SelectItem value="parking">Parking Bay</SelectItem>
                  <SelectItem value="solar">Solar Share</SelectItem>
                  <SelectItem value="room">Community Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Riverside District"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxPrice">Max Price (₹/h)</Label>
              <Input
                id="maxPrice"
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: Number(e.target.value) })}
                min={0}
                required
              />
            </div>
            <div className="grid gap-3">
              <div className="flex justify-between">
                <Label>Priority</Label>
                <span className="text-xs text-muted-foreground">{formData.priority}/10</span>
              </div>
              <Slider
                value={[formData.priority]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) => setFormData({ ...formData, priority: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
