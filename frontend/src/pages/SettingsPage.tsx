import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage application preferences and integrations.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-10 shadow-sm text-center">
        <Settings className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Settings panel coming soon.</p>
      </div>
    </div>
  );
}
