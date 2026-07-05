import { useState } from "react";
import { MapPin, Package, Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWarehouses, DeleteWarehouse } from "@/lib/api";
import { toast } from "sonner";
import AddWarehouseModal from "./AddWarehouseModal";
import EditWarehouseModal from "./EditWarehouseModal";
import WarehouseProductsModal from "./WarehouseProductsModal";

export default function Warehouses() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [viewingWarehouse, setViewingWarehouse] = useState(null);

  const isSuperuser = localStorage.getItem("is_superuser") === "true";
  const canManageWarehouses = localStorage.getItem("can_manage_warehouses") === "true";
  const hasWarehouseAccess = isSuperuser || canManageWarehouses;

  const {
    data: warehouses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["warehouses_detail"],
    queryFn: () => getWarehouses(),
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: (id) => DeleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses_detail"] });
      toast.success("Warehouse deleted successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to delete warehouse");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Warehouses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of all warehouse locations.
          </p>
        </div>

        {hasWarehouseAccess && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add New Warehouse
          </button>
        )}
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
              onClick={() => setViewingWarehouse(w)}
              className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {w.name}
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground block">
                    {w.code}
                  </span>
                </div>

                {/*ปุ่มแก้ไขและปุ่มลบ*/}
                {hasWarehouseAccess && (
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 hover:bg-muted rounded-md transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingWarehouse(w);
                      }}
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
                      disabled={deleteWarehouseMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete the warehouse "${w.name}"?`)) {
                          deleteWarehouseMutation.mutate(w.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />{" "}
                {w.location || "No location set"}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Package className="h-3.5 w-3.5" /> {w.total_products || 0} products
                tracked
              </div>
            </div>
          ))}
        </div>
      )}

      <AddWarehouseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditWarehouseModal
        isOpen={!!editingWarehouse}
        onClose={() => setEditingWarehouse(null)}
        warehouse={editingWarehouse}
      />

      {viewingWarehouse && (
        <WarehouseProductsModal
          warehouse={viewingWarehouse}
          onClose={() => setViewingWarehouse(null)}
        />
      )}
    </div>
  );
}
