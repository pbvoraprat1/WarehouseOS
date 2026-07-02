import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UpdateProduct } from "../lib/api";

export default function EditProductModal({ isOpen, onClose, product }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category_name: "",
    base_price: 0,
    reorder_level: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || "",
        name: product.name || "",
        category_name: product.category_name || "",
        base_price: product.base_price || 0,
        reorder_level: product.reorder_level || 0,
      });
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => UpdateProduct({ id, payload }),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error("Failed to update product.");
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product) return;

    updateMutation.mutate({
      id: product.id,
      payload: formData,
    });
  };
  // ป้องกันการเปิด modal ถ้าไม่มี product
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Edit Product: {product.sku}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            {/* SKU Field (Read-only) */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                SKU <span className="text-muted-foreground font-normal text-xs">(Read-only)</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                disabled
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed focus:outline-none"
              />
            </div>

            {/* Product Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Category
              </label>
              <input
                type="text"
                value={formData.category_name}
                onChange={(e) =>
                  setFormData({ ...formData, category_name: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Base Price */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Base Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_price: parseFloat(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            {/* Reorder Level */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Reorder Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorder_level: parseInt(e.target.value, 10),
                  })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>
            
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}