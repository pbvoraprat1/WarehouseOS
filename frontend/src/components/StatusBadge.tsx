import { cn } from "@/lib/utils";

type Variant = "in" | "out" | "adj" | "success" | "warning" | "danger";

const styles: Record<Variant, string> = {
  in: "bg-success/10 text-success",
  out: "bg-destructive/10 text-destructive",
  adj: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", styles[variant])}>
      {children}
    </span>
  );
}
