import { useState } from "react";
import { MapPin, Package, Loader2, Plus, Edit, Trash2, Search, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DeleteWarehouse,
  getPaginatedWarehouses,
} from "@/lib/api";
import { toast } from "sonner";
import AddWarehouseModal from "./AddWarehouseModal";
import EditWarehouseModal from "./EditWarehouseModal";
import WarehouseProductsModal from "./WarehouseProductsModal";

export default function Warehouses() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [viewingWarehouse, setViewingWarehouse] = useState(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState(null);

  const isSuperuser = localStorage.getItem("is_superuser") === "true";
  const canManageWarehouses =
    localStorage.getItem("can_manage_warehouses") === "true";
  const hasWarehouseAccess = isSuperuser || canManageWarehouses;

  // สำหรับ page
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const {
    data: warehousesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["warehouses_detail", page, search],
    queryFn: () => getPaginatedWarehouses(page, search),
  });

  // ดึงข้อมูลสินค้าในคลังสินค้าตาม page และ search
  const warehouses = warehousesData?.results || warehousesData || [];
  const hasNext = !!warehousesData?.next;
  const hasPrevious = !!warehousesData?.previous;

  const deleteWarehouseMutation = useMutation({
    mutationFn: (id) => DeleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses_detail"] });
      toast.success("Warehouse deleted successfully!");
      setDeletingWarehouse(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to delete warehouse");
      setDeletingWarehouse(null);
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

      {/* ช่องค้นหาคลังสินค้า */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or location..."
          className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow"
        />
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
        <>
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

                  {/* ปุ่มแก้ไขและปุ่มลบ */}
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
                          setDeletingWarehouse(w);
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
                  <Package className="h-3.5 w-3.5" /> {w.total_products || 0}{" "}
                  products tracked
                </div>
              </div>
            ))}
          </div>

          {/* ปุ่ม Pagination */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Showing page {page}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrevious}
                className="px-3 py-1.5 rounded-md border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="px-3 py-1.5 rounded-md border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
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

      {/* Delete Confirmation Modal */}
      {deletingWarehouse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-red-500/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-red-500/30 bg-red-500/5">
              <h2 className="font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Confirm Deletion
              </h2>
            </div>
            <div className="p-5 space-y-4 text-center">
              <p className="text-sm text-foreground">
                Are you sure you want to delete the warehouse <strong>"{deletingWarehouse.name}"</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                This action will mark the warehouse as inactive and remove it from normal views.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2 bg-muted/10">
              <button
                onClick={() => setDeletingWarehouse(null)}
                disabled={deleteWarehouseMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteWarehouseMutation.mutate(deletingWarehouse.id)}
                disabled={deleteWarehouseMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteWarehouseMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleteWarehouseMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}