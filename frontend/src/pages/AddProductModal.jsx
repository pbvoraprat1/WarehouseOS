import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { getAllProducts } from "../lib/api";

const productSchema = z.object({
    sku: z.string().min(1, "Please enter a SKU"),
    name: z.string().min(1, "Please enter a product name"),
    category_name: z.string().min(1, "Please enter a category"),
    base_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
    reorder_level: z.coerce.number().min(0, "Reorder level cannot be negative")
})
export default function AddProductModal({ isOpen, onClose, canManageReorderLevel = true }) {
    const queryClient = useQueryClient();
    //React Hook Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            sku: "",
            name: "",
            category_name: "",
            base_price: "",
            reorder_level: 10,
        }
    });
    const {
        data: products = [],
        isLoading,
        isError,
    } = useQuery({ queryKey: ["products"], queryFn: getAllProducts });
    // กรองเอาเฉพาะหมวดหมู่ที่ไม่ซ้ำกัน และตัดค่าว่างทิ้ง
    const existingCategories = [
        ...new Set(products.map((p) => p.category_name).filter(Boolean)),
    ];
    //useMutation สำหรับยิง API บันทึกข้อมูล
    const addProductMutation = useMutation({
        mutationFn: (newProduct) => api.post("/warehouse/products/", newProduct),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
            toast.success("Success!");
            reset();
            onClose();
        },
        onError: (error) => {
            console.error("", error);
            toast.error("Failed to add product");
        }
    });
    const onSubmit = (data) => {
        addProductMutation.mutate(data);
    };
    //ล้างฟอร์มเวลาผู้ใช้กดปิดหน้าต่างกะทันหัน
    const handleClose = () => {
        reset();
        onClose();
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                    <h2 className="text-lg font-semibold text-foreground">Add New Product</h2>
                    <button
                        onClick={handleClose}
                        className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"
                        disabled={addProductMutation.isPending}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 space-y-4">

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">SKU (รหัสสินค้า) *</label>
                            <input
                                {...register("sku")}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="เช่น SKU-10007"
                            />
                            {errors.sku && <span className="text-xs text-red-500">{errors.sku.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Product Name (ชื่อสินค้า) *</label>
                            <input
                                {...register("name")}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="ชื่อสินค้า"
                            />
                            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Category (หมวดหมู่) *</label>
                            <input
                                {...register("category_name")}
                                list="category-options"
                                autoComplete="off"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="เช่น Electronics"
                            />
                            <datalist id="category-options">
                                {isLoading ? (
                                    <option disabled>Loading categories...</option>
                                ) : isError ? (
                                    <option disabled>Error loading categories</option>
                                ) : existingCategories.length > 0 ? (
                                    existingCategories.map((cat, index) => (
                                        <option key={index} value={cat} />
                                    ))
                                ) : (
                                    <option disabled>No categories found</option>
                                )}
                            </datalist>
                            {errors.category_name && <span className="text-xs text-red-500">{errors.category_name.message}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Base Price ($) *</label>
                                <input
                                    type="number" step="0.01"
                                    {...register("base_price")}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="0.00"
                                />
                                {errors.base_price && <span className="text-xs text-red-500">{errors.base_price.message}</span>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">
                                    Reorder Level * {!canManageReorderLevel && <span className="text-muted-foreground font-normal text-xs">(Admin only)</span>}
                                </label>
                                <input
                                    type="number"
                                    {...register("reorder_level")}
                                    className={`w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${!canManageReorderLevel ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-background'}`}
                                    placeholder="จุดสั่งซื้อ"
                                    disabled={!canManageReorderLevel}
                                />
                                {errors.reorder_level && <span className="text-xs text-red-500">{errors.reorder_level.message}</span>}
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-muted/20">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground transition-colors"
                            disabled={addProductMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity disabled:opacity-50"
                            disabled={addProductMutation.isPending}
                        >
                            {addProductMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Product
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
