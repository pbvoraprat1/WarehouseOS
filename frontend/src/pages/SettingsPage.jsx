import { useState } from "react";
import { Settings, History, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActivityLogs } from "../lib/api";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const isSuperuser = localStorage.getItem("is_superuser") === "true";
  
  //State สำหรับเพจ
  const [page, setPage] = useState(1);

  //ดึงข้อมูลด้วย useQuery
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["activityLogs", page],
    queryFn: () => getActivityLogs(page),
    // เปิดการยิง API เฉพาะตอนที่กดแท็บ history และเป็น admin เท่านั้น
    enabled: activeTab === "history" && isSuperuser,
  });
  //สำหรับปุ่ม page
  const logs = data?.results || data || [];
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage application preferences and integrations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
              activeTab === "general"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            General Settings
          </button>

          {isSuperuser && (
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                activeTab === "history"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <History className="h-4 w-4" />
              Activity History
            </button>
          )}
        </div>
        
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="rounded-xl border border-border bg-card p-10 shadow-sm text-center">
              <Settings className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Settings panel coming soon.
              </p>
            </div>
          )}

          {/* เนื้อหาหน้า History สำหรับ Admin */}
          {activeTab === "history" && isSuperuser && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border bg-muted/20">
                <h2 className="font-semibold text-foreground">System Audit Log</h2>
              </div>

              {/* ส่วนตารางข้อมูล */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                        Time
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                        User
                      </th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                          Loading history...
                        </td>
                      </tr>
                    ) : isError ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-destructive">
                          Failed to load history.
                        </td>
                      </tr>
                    ) : !logs || logs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                          No activity logs found.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-medium text-foreground">
                            {log.user}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {log.action}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ส่วน Pagination */}
              <div className="px-5 py-4 border-t border-border flex items-center justify-between text-sm bg-card">
                <span className="text-muted-foreground">
                  Showing page {page}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!hasPrevious}
                    className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNext}
                    className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}