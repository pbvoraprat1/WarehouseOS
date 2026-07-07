import { useState } from "react";
import { ArrowLeftRight, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProducts, getAllWarehouse, createStockMovement, getStockBalance } from "@/lib/api";

export default function StockMovements() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    type: "IN",
    quantity: "",
    reference: "",
  });

  // Fetch Products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getAllProducts(),
  });

  // Fetch Warehouses
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => getAllWarehouse(),
  });

  // Fetch Stock Balance for selected Product & Warehouse
  const { data: stockBalance, isLoading: isStockLoading } = useQuery({
    queryKey: ["stockBalance", form.productId, form.warehouseId],
    queryFn: () => getStockBalance(form.productId, form.warehouseId),
    enabled: !!form.productId && !!form.warehouseId,
  });

  // Mutation for creating transaction (ย้าย API ไปไว้ที่ lib/api.js แล้ว)
  const mutation = useMutation({
    mutationFn: (data) => createStockMovement({
      product_id: data.productId,
      warehouse_id: data.warehouseId,
      transaction_type: data.type,
      quantity: parseInt(data.quantity),
      reference_document: data.reference || "",
    }),
    onSuccess: (data) => {
      toast.success(data.message || `Transaction recorded successfully`);
      setForm({
        productId: "",
        warehouseId: "",
        type: "IN",
        quantity: "",
        reference: "",
      });
      // Invalidate products query to update stock in preview
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stockBalance"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const selectedProduct = products.find((p) => p.id === form.productId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.productId || !form.warehouseId || !form.quantity) {
      toast.error("Please fill all required fields.");
      return;
    }
    mutation.mutate(form);
  };

  // สำหรับ disabled ให้ดูจางลงและกดไม่ได้
  const inputClass =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow disabled:opacity-50 disabled:bg-muted/50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  // เช็คสิทธิ์ผู้ใช้
  const isSuperuser = localStorage.getItem('is_superuser') === 'true';
  const canCreateTransaction = isSuperuser || localStorage.getItem('can_manage_stock_movements') === 'true';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Stock Movements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record goods receiving, issuing, or stock adjustments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              New Transaction
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Product *</label>
              <select
                disabled={!canCreateTransaction} // ล็อคถ้าไม่มีสิทธิ์
                value={form.productId}
                onChange={(e) =>
                  setForm({ ...form, productId: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Warehouse *</label>
              <select
                disabled={!canCreateTransaction} // ล็อคถ้าไม่มีสิทธิ์
                value={form.warehouseId}
                onChange={(e) =>
                  setForm({ ...form, warehouseId: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Transaction Type *</label>
            <div className="flex gap-3">
              {["IN", "OUT", "ADJ"].map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!canCreateTransaction} // ล็อคถ้าไม่มีสิทธิ์
                  onClick={() => setForm({ ...form, type: t })}
                  className={cn(
                    "flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    form.type === t
                      ? t === "IN"
                        ? "border-success bg-success/10 text-success"
                        : t === "OUT"
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t === "IN"
                    ? "Receive (IN)"
                    : t === "OUT"
                      ? "Issue (OUT)"
                      : "Adjust (ADJ)"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quantity *</label>
              <input
                type="number"
                min="1"
                disabled={!canCreateTransaction} // ล็อคถ้าไม่มีสิทธิ์
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="Enter quantity"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Reference Document</label>
              <input
                type="text"
                disabled={!canCreateTransaction} // ล็อคถ้าไม่มีสิทธิ์
                value={form.reference}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
                placeholder="PO-2024-XXXX"
                className={inputClass}
              />
            </div>
          </div>

          {!canCreateTransaction && (
            <div className="p-3 text-sm text-red-500 bg-red-100/10 border border-red-500/50 rounded-md text-center">
              You do not have permission to create stock transactions.
            </div>
          )}

          {canCreateTransaction && (
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mutation.isPending ? "Submitting..." : "Submit Transaction"}
            </button>
          )}
        </form>

        {/* Preview Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Stock Preview
            </h2>
          </div>
          {selectedProduct ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Product</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedProduct.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="text-sm font-mono text-foreground">
                  {selectedProduct.sku}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Current Stock {form.warehouseId ? "(in selected warehouse)" : "(all warehouses)"}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold text-foreground">
                    {isStockLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground inline" />
                    ) : (
                      form.warehouseId ? (stockBalance?.quantity ?? 0) : selectedProduct.total_stock
                    )}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reorder Level</p>
                <p className="text-sm text-foreground">
                  {selectedProduct.reorder_level}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge
                  variant={
                    (form.warehouseId ? (stockBalance?.quantity ?? 0) : selectedProduct.total_stock) === 0
                      ? "danger"
                      : (form.warehouseId ? (stockBalance?.quantity ?? 0) : selectedProduct.total_stock) <=
                        selectedProduct.reorder_level
                        ? "warning"
                        : "success"
                  }
                >
                  {(form.warehouseId ? (stockBalance?.quantity ?? 0) : selectedProduct.total_stock) === 0
                    ? "Out of Stock"
                    : (form.warehouseId ? (stockBalance?.quantity ?? 0) : selectedProduct.total_stock) <=
                      selectedProduct.reorder_level
                      ? "Low Stock"
                      : "In Stock"}
                </StatusBadge>
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/30 mb-2" />
              Select a product to preview stock balance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}