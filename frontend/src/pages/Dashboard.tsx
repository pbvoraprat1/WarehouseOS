import { useState } from "react";
import { AlertTriangle, XCircle, TrendingDown, ChevronDown, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

// ==========================================
// 1. Interfaces (กำหนดหน้าตาข้อมูลสำหรับ TypeScript)
// ==========================================

// สำหรับรายชื่อคลังสินค้าใน Dropdown
interface WarehouseItem {
  id: number;
  name: string;
}

// สำหรับข้อมูลใน Dashboard หลัก
interface DashboardData {
  warehouse_name: string;
  summary: {
    total_low_stock: number;
    out_of_stock: number;
    near_out_of_stock: number;
  };
  low_stock_products: Array<{
    product: string; 
    quantity: number;
  }>;
  recent_transactions: Array<{
    transaction_type: string;
    quantity: number;
    reference_document: string | null;
  }>;
}

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const username = import.meta.env.VITE_API_USERNAME;
const password = import.meta.env.VITE_API_PASSWORD;
const token = btoa(`${username}:${password}`);

export default function Dashboard() {
  // ==========================================
  // 2. States (ตัวแปรเก็บสถานะต่างๆ)
  // ==========================================
  
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(""); 
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ==========================================
  // 3. React Query สำหรับดึงข้อมูล
  // ==========================================

  // 3.1 ดึงรายชื่อคลังสินค้าทั้งหมด
  const { data: warehouseList = [], isLoading: isLoadingWarehouses } = useQuery<WarehouseItem[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/warehouse/list/`, {
        headers: { 'Authorization': `Basic ${token}` }
      });
      if (!response.ok) throw new Error('ดึงข้อมูลรายชื่อคลังสินค้าไม่สำเร็จ');
      const data = await response.json();
      
      // เลือกคลังแรกอัตโนมัติถ้ายังไม่ได้เลือก
      if (data.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(data[0].id.toString());
      }
      return data;
    }
  });

  // 3.2 ดึงข้อมูล Dashboard เมื่อมีการเลือกคลังแล้ว
  const { data: dbData, isLoading: isLoadingDashboard, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard', selectedWarehouseId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/warehouse/dashboard/${selectedWarehouseId}/`, {
        headers: { 'Authorization': `Basic ${token}` }
      });
      if (!response.ok) throw new Error('ดึงข้อมูล Dashboard ไม่สำเร็จ');
      return response.json();
    },
    enabled: !!selectedWarehouseId // query จะรันก็ต่อเมื่อมีค่า selectedWarehouseId
  });

  const isLoading = isLoadingWarehouses || isLoadingDashboard;

  // ==========================================
  // 4. การแสดงผลกรณี Loading หรือ Error
  // ==========================================
  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-muted-foreground gap-3">
        <Loader2 className="h-6 w-6 animate-spin" />
        กำลังเชื่อมต่อและดึงข้อมูลจากระบบ...
      </div>
    );
  }

  // หาชื่อคลังที่กำลังเลือกอยู่ เพื่อเอาไปโชว์ตรงปุ่ม Dropdown
  const activeWarehouse = warehouseList.find(w => w.id.toString() === selectedWarehouseId);
  const dropdownDisplayLabel = activeWarehouse ? activeWarehouse.name : (dbData?.warehouse_name || "เลือกคลังสินค้า");

  if (!dbData || isError) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
        <div className="text-destructive font-semibold">ไม่พบข้อมูลคลังสินค้านี้ หรือเกิดข้อผิดพลาดในการเชื่อมต่อ</div>
      </div>
    );
  }

  // ==========================================
  // 5. การแสดงผล UI หลัก (Render)
  // ==========================================
  return (
    <div className="space-y-6">
      {/* --- Header & Dynamic Dropdown --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Warehouse Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor inventory levels and recent activity.</p>
        </div>
        
        <div className="relative">
          {/* ปุ่มกดเปิด-ปิด Dropdown */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors min-w-[200px] justify-between"
          >
            <span className="truncate">{dropdownDisplayLabel}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>

          {/* รายการคลังสินค้าที่ดึงมาจาก API อัตโนมัติ */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-lg border border-border bg-card shadow-lg z-10 max-h-60 overflow-y-auto">
              {warehouseList.length > 0 ? (
                warehouseList.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => { 
                      setSelectedWarehouseId(w.id.toString());
                      setDropdownOpen(false); 
                    }}
                    className={cn(
                      "block w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg",
                      selectedWarehouseId === w.id.toString() 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {w.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">ไม่มีข้อมูลคลังสินค้า</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- Summary Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Low Stock", value: dbData.summary.total_low_stock, icon: TrendingDown, color: "text-warning" },
          { label: "Out of Stock (Critical)", value: dbData.summary.out_of_stock, icon: XCircle, color: "text-destructive" },
          { label: "Near Out of Stock", value: dbData.summary.near_out_of_stock, icon: AlertTriangle, color: "text-warning" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <card.icon className={cn("h-5 w-5", card.color)} />
            </div>
            <p className="mt-2 text-3xl font-semibold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {/* --- Tables Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Low Stock Alerts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Product ID</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {dbData.low_stock_products.length > 0 ? (
                  dbData.low_stock_products.map((p, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "border-b border-border last:border-0 transition-colors",
                        p.quantity === 0 ? "bg-destructive/5" : "hover:bg-muted/30"
                      )}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground truncate max-w-[200px]">{p.product}</td>
                      <td className="px-5 py-3 text-right">
                        <StatusBadge variant={p.quantity === 0 ? "danger" : "warning"}>
                          {p.quantity}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={2} className="px-5 py-8 text-center text-muted-foreground">ไม่มีสินค้าขาดสต็อก 🎉</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-5 py-3 text-right font-medium text-muted-foreground">Quantity</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Reference</th>
                </tr>
              </thead>
              <tbody>
                {dbData.recent_transactions.length > 0 ? (
                  dbData.recent_transactions.map((t, index) => (
                    <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <StatusBadge variant={t.transaction_type === "IN" ? "in" : t.transaction_type === "OUT" ? "out" : "adj"}>
                          {t.transaction_type}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-foreground">{t.quantity}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{t.reference_document || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">ไม่มีประวัติการเคลื่อนไหว</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}