import { useState } from "react";
import { Settings, History, Users, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getActivityLogs, getAllUsers, updateUserPermission, hardDeleteData, createNewUser } from "../lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const isSuperuser = localStorage.getItem("is_superuser") === "true";
  const canViewActivityLogs = localStorage.getItem("can_view_activity_logs") === "true";
  const hasLogAccess = isSuperuser || canViewActivityLogs;
  const queryClient = useQueryClient();

  // State สำหรับ Modal สร้าง User
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // State สำหรับ Modal ยืนยันการลบ
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deleteTargetType, setDeleteTargetType] = useState(null);

  // State สำหรับเพจ (History)
  const [page, setPage] = useState(1);

  // ดึงข้อมูลด้วย useQuery สำหรับ History
  const { data: historyData, isLoading: historyLoading, isError: historyError } = useQuery({
    queryKey: ["activityLogs", page],
    queryFn: () => getActivityLogs(page),
    enabled: activeTab === "history" && hasLogAccess,
  });

  // ดึงข้อมูลด้วย useQuery สำหรับ Users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: activeTab === "users" && isSuperuser,
  });

  // Mutation สำหรับ update permission
  const togglePermissionMutation = useMutation({
    mutationFn: ({ userId, data }) => updateUserPermission(userId, data),
    onSuccess: () => {
      toast.success("User permissions updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error("Error updating permissions.");
      console.error(error);
    },
  });
  // Mutation สำหรับ hard delete
  const hardDeleteMutation = useMutation({
    mutationFn: (type) => hardDeleteData(type),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["activityLogs", page] });
      setIsConfirmDeleteModalOpen(false);
      setDeleteTargetType(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Hard delete failed.");
      console.error(error);
      setIsConfirmDeleteModalOpen(false);
      setDeleteTargetType(null);
    }
  });

  // Mutaion สำหรับสร้าง user ใหม่
  const createUserMutation = useMutation({
    mutationFn: createNewUser,
    onSuccess: () => {
      toast.success("User created successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateUserModalOpen(false);
      setNewUsername("");
      setNewPassword("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to create user.");
      console.error(error);
    }
  });


  // ฟังก์ชันสำหรับ toggle permission
  const handleToggle = (userId, field, currentValue) => {
    togglePermissionMutation.mutate({
      userId,
      data: { [field]: !currentValue }
    });
  };

  // สำหรับปุ่ม page
  const logs = historyData?.results || historyData || [];
  const hasNext = !!historyData?.next;
  const hasPrevious = !!historyData?.previous;

  // คอมโพเนนต์ปุ่ม Toggle
  const PermissionToggle = ({ user, field }) => {
    if (user.is_superuser) {
      return <span className="text-emerald-500 font-medium text-[10px] bg-emerald-500/10 px-2 py-1 rounded-md">Admin</span>;
    }

    const isGranted = user[field];
    return (
      <button
        onClick={() => handleToggle(user.id, field, isGranted)}
        disabled={togglePermissionMutation.isPending}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50",
          isGranted ? "bg-emerald-500" : "bg-muted-foreground/30"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            isGranted ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage application preferences and user access.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* แถบเมนูด้านซ้าย */}
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
              onClick={() => setActiveTab("users")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                activeTab === "users"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              User Management
            </button>
          )}

          {hasLogAccess && (
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

          {isSuperuser && (
            <button
              onClick={() => setActiveTab("danger")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left mt-4",
                activeTab === "danger"
                  ? "bg-red-500/10 text-red-600"
                  : "text-red-500/70 hover:bg-red-500/10 hover:text-red-600"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </button>
          )}
        </div>

        {/* เนื้อหาหลักด้านขวา */}
        <div className="flex-1">

          {/* แท็บ General */}
          {activeTab === "general" && (
            <div className="rounded-xl border border-border bg-card p-10 shadow-sm text-center">
              <Settings className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Settings panel coming soon.
              </p>
            </div>
          )}

          {/* แท็บ User Management */}
          {activeTab === "users" && isSuperuser && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
                <h2 className="font-semibold text-foreground">User Management</h2>

                <button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={createUserMutation.isPending}
                  onClick={() => setIsCreateUserModalOpen(true)}
                >
                  + Add New User
                </button>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">User</th>
                      <th className="px-5 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">Products</th>
                      <th className="px-5 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">Reorder</th>
                      <th className="px-5 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">Movements</th>
                      <th className="px-5 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">Warehouses</th>
                      <th className="px-5 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">Logs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr><td colSpan={6} className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : (
                      usersData?.map((user) => (
                        <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4 font-medium text-foreground whitespace-nowrap">
                            {user.username}
                          </td>
                          <td className="px-5 py-4 text-center"><PermissionToggle user={user} field="can_manage_products" /></td>
                          <td className="px-5 py-4 text-center"><PermissionToggle user={user} field="can_manage_auto_reorder" /></td>
                          <td className="px-5 py-4 text-center"><PermissionToggle user={user} field="can_manage_stock_movements" /></td>
                          <td className="px-5 py-4 text-center"><PermissionToggle user={user} field="can_manage_warehouses" /></td>
                          <td className="px-5 py-4 text-center"><PermissionToggle user={user} field="can_view_activity_logs" /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* แท็บ History */}
          {activeTab === "history" && hasLogAccess && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border bg-muted/20">
                <h2 className="font-semibold text-foreground">System Audit Log</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Time</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">User</th>
                      <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" /> Loading history...
                        </td>
                      </tr>
                    ) : historyError ? (
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
                            {log.action
                              .split(/(update[a-z]*|delete[a-z]*|create[a-z]*|add[a-z]*)/i)
                              .map((part, index) => {
                                const lowerPart = part.toLowerCase();
                                if (lowerPart.startsWith("delete")) return <span key={index} className="text-red-500 font-medium">{part}</span>;
                                if (lowerPart.startsWith("update")) return <span key={index} className="text-amber-500 font-medium">{part}</span>;
                                if (lowerPart.startsWith("create") || lowerPart.startsWith("add")) return <span key={index} className="text-emerald-500 font-medium">{part}</span>;
                                return <span key={index}>{part}</span>;
                              })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>




              {/* ส่วน Pagination ของ History */}
              <div className="px-5 py-4 border-t border-border flex items-center justify-between text-sm bg-card">
                <span className="text-muted-foreground">Showing page {page}</span>
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

          {/* แท็บ Danger Zone */}
          {activeTab === "danger" && isSuperuser && (
            <div className="rounded-xl border border-red-500/30 bg-card shadow-sm overflow-hidden flex flex-col animate-in fade-in">
              <div className="px-5 py-4 border-b border-red-500/30 bg-red-500/5">
                <h2 className="font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Danger Zone
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-sm text-muted-foreground">
                  The actions below will <strong>permanently delete</strong> data from the database. This cannot be undone.
                  (Only items currently in the recycle bin / `is_active = False` will be removed.)
                </p>

                <div className="space-y-4">
                  {/* ลบ Product */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-muted/20">
                    <div>
                      <h3 className="font-medium text-foreground">Empty Deleted Products</h3>
                      <p className="text-xs text-muted-foreground">Permanently wipe all products that have been soft-deleted.</p>
                    </div>
                    <button
                      disabled={hardDeleteMutation.isPending}
                      onClick={() => {
                        setDeleteTargetType("products");
                        setIsConfirmDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      <Trash2 className="h-4 w-4" /> Clear Products
                    </button>
                  </div>

                  {/* ลบ Warehouse */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-muted/20">
                    <div>
                      <h3 className="font-medium text-foreground">Empty Deleted Warehouses</h3>
                      <p className="text-xs text-muted-foreground">Permanently wipe all warehouses that have been soft-deleted.</p>
                    </div>
                    <button
                      disabled={hardDeleteMutation.isPending}
                      onClick={() => {
                        setDeleteTargetType("warehouses");
                        setIsConfirmDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      <Trash2 className="h-4 w-4" /> Clear Warehouses
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-foreground">Create New User</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2 bg-muted/10">
              <button
                onClick={() => {
                  setIsCreateUserModalOpen(false);
                  setNewUsername("");
                  setNewPassword("");
                }}
                disabled={createUserMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newUsername || !newPassword) {
                    toast.error("Please fill in both fields.");
                    return;
                  }
                  createUserMutation.mutate({ username: newUsername, password: newPassword });
                }}
                disabled={createUserMutation.isPending}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-red-500/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-red-500/30 bg-red-500/5">
              <h2 className="font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Confirm Deletion
              </h2>
            </div>
            <div className="p-5 space-y-4 text-center">
              <p className="text-sm text-foreground">
                Are you completely sure you want to clear <strong>{deleteTargetType}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be reversed and all related soft-deleted data will be permanently wiped.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2 bg-muted/10">
              <button
                onClick={() => {
                  setIsConfirmDeleteModalOpen(false);
                  setDeleteTargetType(null);
                }}
                disabled={hardDeleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => hardDeleteMutation.mutate(deleteTargetType)}
                disabled={hardDeleteMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {hardDeleteMutation.isPending ? "Deleting..." : "Yes, Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}