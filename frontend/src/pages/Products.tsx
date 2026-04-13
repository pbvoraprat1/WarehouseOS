import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { products } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Products() {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog and inventory levels.</p>
        </div>
        <button
          onClick={() => toast.info("Add Product modal — coming soon.")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add New Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, SKU, or category…"
          className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["SKU", "Product Name", "Category", "Base Price", "Stock", "Reorder Lvl", "Action"].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className={cn("border-b border-border last:border-0 hover:bg-muted/30 transition-colors", p.currentStock === 0 && "bg-destructive/5")}>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-5 py-3 text-foreground">${p.basePrice.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <StatusBadge variant={p.currentStock === 0 ? "danger" : p.currentStock <= p.reorderLevel ? "warning" : "success"}>
                    {p.currentStock}
                  </StatusBadge>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{p.reorderLevel}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => toast.info(`Edit ${p.name}`)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast.error(`Delete ${p.name}`)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
