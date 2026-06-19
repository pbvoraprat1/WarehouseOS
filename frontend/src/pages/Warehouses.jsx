import { MapPin, Package, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getWarehouses } from "@/lib/api";
import api from "@/lib/axios";

export default function Warehouses() {
  const {
    data: warehouses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["warehouses_detail"],
    queryFn: () => getWarehouses(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Warehouses
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of all warehouse locations.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-40 flex-col items-center justify-center text-muted-foreground gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading warehouses...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          Error loading warehouses. Please try again later.
        </div>
      ) : warehouses.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No warehouses found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {w.name}
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {w.code}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />{" "}
                {w.location || "No location set"}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Package className="h-3.5 w-3.5" /> {w.total_products} products
                tracked
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
