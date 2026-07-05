import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createWarehouse, getWarehouses } from "../lib/api";

const warehouseSchema = z.object({
    name: z.string().min(1, "Please enter a warehouse name"),
    code: z.string().min(1, "Please enter a warehouse code"),
    location: z.string().min(1, "Please enter a location"),
    is_active: z.boolean().default(true),
})

export default function AddWarehouseModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(warehouseSchema),
        defaultValues: {
            name: "",
            code: "",
            location: "",
            is_active: true,
        }
    });

    const { data: warehouses = [], isLoading: isLoadingWarehouses } = useQuery({
        queryKey: ["warehouses_detail"],
        queryFn: () => getWarehouses(),
        enabled: isOpen, // Only fetch when modal is open
    });

    const existingLocations = [
        ...new Set(warehouses.map((w) => w.location).filter(Boolean)),
    ];

    const addWarehouseMutation = useMutation({
        mutationFn: (newWarehouse) => createWarehouse(newWarehouse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouses_detail"] })
            toast.success("Warehouse added successfully!");
            reset();
            onClose();
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to add warehouse");
        }
    });

    const onSubmit = (data) => {
        addWarehouseMutation.mutate(data);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                    <h2 className="text-lg font-semibold text-foreground">Add New Warehouse</h2>
                    <button
                        onClick={handleClose}
                        className="text-muted-foreground hover:bg-muted p-1 rounded-md transition-colors"
                        disabled={addWarehouseMutation.isPending}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Warehouse Code *</label>
                            <input
                                {...register("code")}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. WH-BKK-01"
                            />
                            {errors.code && <span className="text-xs text-red-500">{errors.code.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Warehouse Name *</label>
                            <input
                                {...register("name")}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Main Warehouse"
                            />
                            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Location *</label>
                            <input
                                {...register("location")}
                                list="location-options"
                                autoComplete="off"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Bangkok"
                            />
                            <datalist id="location-options">
                                {isLoadingWarehouses ? (
                                    <option disabled>Loading locations...</option>
                                ) : existingLocations.length > 0 ? (
                                    existingLocations.map((loc, index) => (
                                        <option key={index} value={loc} />
                                    ))
                                ) : null}
                            </datalist>
                            {errors.location && <span className="text-xs text-red-500">{errors.location.message}</span>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-muted/20">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-muted-foreground transition-colors"
                            disabled={addWarehouseMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity disabled:opacity-50"
                            disabled={addWarehouseMutation.isPending}
                        >
                            {addWarehouseMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Warehouse
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
