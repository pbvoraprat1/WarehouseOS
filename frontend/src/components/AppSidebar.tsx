import { LayoutDashboard, Package, ArrowLeftRight, Warehouse, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "Stock Movements", path: "/stock-movements", icon: ArrowLeftRight },
  { label: "Warehouses", path: "/warehouses", icon: Warehouse },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Warehouse className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-accent-foreground">WarehouseOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">John Doe</p>
            <p className="text-xs text-sidebar-muted truncate">john@company.com</p>
          </div>
          <button className="text-sidebar-muted hover:text-sidebar-accent-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
