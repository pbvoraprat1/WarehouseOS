export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  reorderLevel: number;
  currentStock: number;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  type: "IN" | "OUT" | "ADJ";
  quantity: number;
  reference: string;
  date: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export const warehouses: Warehouse[] = [
  { id: "WH-001", name: "Main Warehouse", location: "Jakarta" },
  { id: "WH-002", name: "North Hub", location: "Surabaya" },
  { id: "WH-003", name: "West Depot", location: "Bandung" },
];

export const products: Product[] = [
  { id: "P-001", sku: "SKU-1001", name: "Industrial Motor 3HP", category: "Motors", basePrice: 450, reorderLevel: 10, currentStock: 3 },
  { id: "P-002", sku: "SKU-1002", name: "Hydraulic Pump A200", category: "Pumps", basePrice: 1200, reorderLevel: 5, currentStock: 0 },
  { id: "P-003", sku: "SKU-1003", name: "Steel Bearing 6205", category: "Bearings", basePrice: 12, reorderLevel: 100, currentStock: 45 },
  { id: "P-004", sku: "SKU-1004", name: "Control Valve DN50", category: "Valves", basePrice: 320, reorderLevel: 8, currentStock: 2 },
  { id: "P-005", sku: "SKU-1005", name: "Conveyor Belt 1200mm", category: "Belts", basePrice: 890, reorderLevel: 3, currentStock: 0 },
  { id: "P-006", sku: "SKU-1006", name: "Gear Reducer RV40", category: "Gears", basePrice: 275, reorderLevel: 15, currentStock: 18 },
  { id: "P-007", sku: "SKU-1007", name: "Pneumatic Cylinder SC50", category: "Cylinders", basePrice: 95, reorderLevel: 20, currentStock: 7 },
  { id: "P-008", sku: "SKU-1008", name: "Coupling Jaw L100", category: "Couplings", basePrice: 55, reorderLevel: 25, currentStock: 0 },
  { id: "P-009", sku: "SKU-1009", name: "Filter Element HF35", category: "Filters", basePrice: 38, reorderLevel: 50, currentStock: 12 },
  { id: "P-010", sku: "SKU-1010", name: "Sensor Proximity M18", category: "Sensors", basePrice: 65, reorderLevel: 30, currentStock: 85 },
];

export const transactions: Transaction[] = [
  { id: "T-001", productId: "P-001", productName: "Industrial Motor 3HP", warehouseId: "WH-001", type: "IN", quantity: 10, reference: "PO-2024-0451", date: "2024-12-10" },
  { id: "T-002", productId: "P-003", productName: "Steel Bearing 6205", warehouseId: "WH-001", type: "OUT", quantity: 55, reference: "SO-2024-1122", date: "2024-12-09" },
  { id: "T-003", productId: "P-002", productName: "Hydraulic Pump A200", warehouseId: "WH-002", type: "OUT", quantity: 5, reference: "SO-2024-1120", date: "2024-12-08" },
  { id: "T-004", productId: "P-006", productName: "Gear Reducer RV40", warehouseId: "WH-001", type: "ADJ", quantity: -2, reference: "ADJ-2024-003", date: "2024-12-08" },
  { id: "T-005", productId: "P-004", productName: "Control Valve DN50", warehouseId: "WH-003", type: "IN", quantity: 15, reference: "PO-2024-0449", date: "2024-12-07" },
  { id: "T-006", productId: "P-007", productName: "Pneumatic Cylinder SC50", warehouseId: "WH-001", type: "OUT", quantity: 13, reference: "SO-2024-1118", date: "2024-12-06" },
  { id: "T-007", productId: "P-009", productName: "Filter Element HF35", warehouseId: "WH-002", type: "IN", quantity: 100, reference: "PO-2024-0447", date: "2024-12-05" },
  { id: "T-008", productId: "P-005", productName: "Conveyor Belt 1200mm", warehouseId: "WH-001", type: "OUT", quantity: 3, reference: "SO-2024-1115", date: "2024-12-04" },
];
