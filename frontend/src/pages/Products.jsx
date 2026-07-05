import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaginatedProducts, DeleteProduct, UpdateProduct } from "../lib/api";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModel";

export default function Products() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // รีเฟรชข้อมูลอัตโนมัติหลังจากมีการเปลี่ยนแปลง เช่น ลบหรือแก้ไขสินค้า
  const queryClient = useQueryClient();

  // เช็คสิทธิ์ผู้ใช้จาก LocalStorage
  const isSuperuser = localStorage.getItem("is_superuser") === "true";
  const canManageProducts = localStorage.getItem("can_manage_products") === "true";
  const hasProductAccess = isSuperuser || canManageProducts;
  const canManageReorderLevel = localStorage.getItem("can_manage_auto_reorder") === "true";

  // ฟังชั่นสำหรับลบ
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");

  // ฟังชั่นสำหรับแก้ไข
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (id) => DeleteProduct(productToDelete.id),
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      setIsDeleteModalOpen(false);
      setConfirmInput("");
      setProductToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error("Failed to delete");
    },
  });

  const UpdateMutation = useMutation({
    mutationFn: ({ id, payload }) => UpdateProduct({ id, payload }),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      setIsEditModalOpen(false);
      setProductToUpdate(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error("Failed to update product");
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page],
    queryFn: () => getPaginatedProducts(page),
  });
  // สำหรับ page
  const products = data?.results || data || [];
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product catalog and inventory levels.
          </p>
        </div>

        {/* Add New Product (ซ่อนปุ่มถ้าไม่มีสิทธิ์) */}
        {hasProductAccess && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add New Product
          </button>
        )}
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
        <table className="w-full text-sm table-auto">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {[
                "SKU",
                "Product Name",
                "Category",
                "Base Price",
                "Stock",
                "Reorder Lvl",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
              {/* Action (ซ่อนหัวตารางถ้าไม่มีสิทธิ์) */}
              {hasProductAccess && (
                <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap w-auto">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={hasProductAccess ? 7 : 6} // ปรับความกว้างคอลัมน์อัตโนมัติ
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading products...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={hasProductAccess ? 7 : 6}
                  className="px-5 py-10 text-center text-destructive"
                >
                  Error loading products. Please try again later.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={hasProductAccess ? 7 : 6}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                    p.total_stock === 0 && "bg-destructive/5",
                  )}
                >
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {p.sku}
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.category_name}
                  </td>
                  <td className="px-5 py-3 text-foreground">
                    ${parseFloat(p.base_price).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      variant={
                        p.total_stock === 0
                          ? "danger"
                          : p.total_stock <= p.reorder_level
                            ? "warning"
                            : "success"
                      }
                    >
                      {p.total_stock}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.reorder_level}
                  </td>

                  {/* Action (ซ่อนปุ่มถ้าไม่มีสิทธิ์) */}
                  {hasProductAccess && (
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setProductToUpdate(p);
                            setIsEditModalOpen(true);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(p);
                            setIsDeleteModalOpen(true);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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

      {/* Modals */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        canManageReorderLevel={isSuperuser || canManageReorderLevel}
      />

      {/* Edit Product Modal */}
      {isEditModalOpen && productToUpdate && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setProductToUpdate(null);
          }}
          product={productToUpdate}
          onSubmit={(updatedData) => {
            UpdateMutation.mutate({
              id: productToUpdate.id,
              payload: updatedData
            });
          }}
          isLoading={UpdateMutation.isPending}
          error={UpdateMutation.error}
          canManageReorderLevel={isSuperuser || canManageReorderLevel}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Confirm Deletion
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Type{" "}
              <strong className="text-foreground">{productToDelete.sku}</strong>{" "}
              to confirm you want to delete{" "}
              <strong className="text-foreground">
                {productToDelete.name}
              </strong>
              . This action cannot be undone.
            </p>

            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={productToDelete.sku}
              className="w-full mb-6 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/40"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmInput("");
                  setProductToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>

              <button
                disabled={
                  confirmInput !== productToDelete.sku ||
                  deleteMutation.isPending
                }
                onClick={() => {
                  deleteMutation.mutate(
                    productToDelete.id || productToDelete.sku,
                  );
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}