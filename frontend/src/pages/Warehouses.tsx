import { MapPin, Package } from "lucide-react";
import { warehouses, products } from "@/data/mockData";

export default function Warehouses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Warehouses</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of all warehouse locations.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((w) => (
          <div key={w.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{w.name}</h3>
              <span className="text-xs font-mono text-muted-foreground">{w.id}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {w.location}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Package className="h-3.5 w-3.5" /> {products.length} products tracked
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
