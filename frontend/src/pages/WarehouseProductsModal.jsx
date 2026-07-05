import { useState } from "react";
import { X, Package, Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getWarehouseProducts } from "../lib/api";

export default function WarehouseProductsModal({ warehouse, onClose }) {
    // สร้าง state เก็บหน้าปัจจุบัน (เริ่มต้นหน้าที่ 1)
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // ดึงข้อมูลผ่าน React Query ถ้าย้ายหน้า page หรือหา searchQuery มันจะโหลดข้อมูลใหม่ให้อัตโนมัติ
    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["warehouse_products", warehouse.id, page, searchQuery],
        queryFn: () => getWarehouseProducts(warehouse.id, page, searchQuery),
    });

    const products = data?.results || [];
    const hasNext = !!data?.next;
    const hasPrevious = !!data?.previous;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl max-h-[90vh] bg-background rounded-xl shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* หัว Modal */}
                <div className="flex flex-col gap-4 border-b p-5 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                <Package className="h-5 w-5 text-primary" />
                                Products in {warehouse.name}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">Location: {warehouse.location}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* ช่องค้นหา */}
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            setSearchQuery(searchInput);
                            setPage(1);
                        }}
                        className="flex items-center gap-2"
                    >
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search SKU or Name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md shadow-sm hover:opacity-90"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* เนื้อหาในตาราง */}
                <div className="p-0 overflow-y-auto overflow-x-auto flex-1 relative">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">SKU</th>
                                <th className="px-6 py-3 font-medium">Product Name</th>
                                <th className="px-6 py-3 font-medium text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading || isFetching ? (
                                <tr><td colSpan="3" className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                            ) : isError ? (
                                <tr><td colSpan="3" className="px-6 py-10 text-center text-red-500">Failed to load products.</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-10 text-center text-muted-foreground">No products found in this warehouse.</td></tr>
                            ) : (
                                products.map((item) => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="px-6 py-4 font-mono text-xs">{item.product_sku}</td>
                                        <td className="px-6 py-4 font-medium">{item.product_name}</td>
                                        <td className="px-6 py-4 text-right font-semibold">{item.quantity}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ส่วนปุ่มเปลี่ยนหน้า Pagination */}
                <div className="border-t p-4 flex items-center justify-between bg-muted/10 text-sm">
                    <span className="text-muted-foreground">Showing page {page}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={!hasPrevious}
                            className="px-3 py-1.5 rounded-md border bg-background hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasNext}
                            className="px-3 py-1.5 rounded-md border bg-background hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
