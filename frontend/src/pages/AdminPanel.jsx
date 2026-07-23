import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  Shield,
  Database,
  History,
  Check,
  X,
  Upload,
  Download,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

export const AdminPanel = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [dbFile, setDbFile] = useState(null);
  const [restoreMessage, setRestoreMessage] = useState("");
  const [restoreError, setRestoreError] = useState("");

  // Role permissions mapping display
  const rolesPermissions = [
    { role: "Admin", read: true, write: true, delete: true, backup: true },
    { role: "HR", read: true, write: true, delete: true, backup: false },
    {
      role: "Supervisor",
      read: true,
      write: true,
      delete: false,
      backup: false,
    },
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await api.admin.getLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleBackup = () => {
    const url = api.admin.getBackupUrl();
    const link = document.createElement("a");
    link.href = url;
    link.download = "worker_db_backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestore = (e) => {
    e.preventDefault();
    if (!dbFile) return;

    setRestoreMessage("");
    setRestoreError("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        const parsed = JSON.parse(text);
        await api.admin.restoreDb(parsed);
        setRestoreMessage(
          "Database successfully restored! Reloading activity log...",
        );
        setDbFile(null);
        fetchLogs();
      } catch (err) {
        setRestoreError(
          err.message || "JSON formatting error or corrupt data.",
        );
      }
    };
    reader.readAsText(dbFile);
  };

  if (user?.role !== "Admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertTriangle size={48} className="text-amber-500 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Access Denied
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          You do not have the necessary security clearancess to view the
          administrator panel. Please login as an <strong>Admin</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("adminPanel")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Perform database operations, check access control rules, and view
          audit trails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Database operations & Role permissions */}
        <div className="lg:col-span-1 space-y-6">
          {/* DB Backups */}
          <Card>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Database size={16} className="text-blue-500" />
              Database Operations
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export the current localStorage database tables to a local JSON
              file or restore from a previous backup.
            </p>

            <div className="mt-4 space-y-4">
              <button
                onClick={handleBackup}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white shadow-md hover:bg-blue-750"
              >
                <Download size={14} />
                Download JSON Backup
              </button>

              <form
                onSubmit={handleRestore}
                className="border-t border-slate-100 pt-4 dark:border-slate-850 space-y-3"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Restore Database
                </span>

                <div className="relative border border-dashed border-slate-200/80 hover:bg-slate-50 dark:border-slate-805 dark:hover:bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                  <Upload size={20} className="text-slate-400" />
                  <span className="text-[10px] text-slate-500 mt-1.5 font-medium">
                    {dbFile ? dbFile.name : "Select Backup JSON file"}
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    required
                    onChange={(e) =>
                      setDbFile(e.target.files ? e.target.files[0] : null)
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {dbFile && (
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Confirm & Restore
                  </button>
                )}

                {restoreMessage && (
                  <p className="text-[10px] text-emerald-600 font-bold text-center mt-1">
                    {restoreMessage}
                  </p>
                )}
                {restoreError && (
                  <p className="text-[10px] text-rose-600 font-bold text-center mt-1">
                    {restoreError}
                  </p>
                )}
              </form>
            </div>
          </Card>

          {/* Role Permissions */}
          <Card>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Shield size={16} className="text-indigo-500" />
              Role Permission Matrix
            </h3>

            <div className="mt-4 space-y-3.5 text-xs">
              {rolesPermissions.map((row) => (
                <div
                  key={row.role}
                  className="border-b border-slate-100 pb-3 last:border-b-0 dark:border-slate-850"
                >
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <UserCheck size={14} className="text-blue-500" />
                    {row.role} Role
                  </h4>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-slate-500">
                    <div className="flex flex-col items-center">
                      <span>Read</span>
                      {row.read ? (
                        <Check size={12} className="text-emerald-500 mt-1" />
                      ) : (
                        <X size={12} className="text-rose-500 mt-1" />
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <span>Write</span>
                      {row.write ? (
                        <Check size={12} className="text-emerald-500 mt-1" />
                      ) : (
                        <X size={12} className="text-rose-500 mt-1" />
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <span>Delete</span>
                      {row.delete ? (
                        <Check size={12} className="text-emerald-500 mt-1" />
                      ) : (
                        <X size={12} className="text-rose-500 mt-1" />
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <span>Backup</span>
                      {row.backup ? (
                        <Check size={12} className="text-emerald-500 mt-1" />
                      ) : (
                        <X size={12} className="text-rose-500 mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Activity Logs Audit Trail */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <History size={16} className="text-blue-500" />
              Activity Audit Logs
            </h3>
            <button
              onClick={fetchLogs}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 hover:underline"
            >
              Refresh logs
            </button>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
            {loadingLogs ? (
              <div className="py-20 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
              </div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center text-slate-500 font-semibold">
                Audit logs are empty.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border-b border-slate-50 pb-3 last:border-b-0 dark:border-slate-850"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-205">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-slate-450 font-normal">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600 leading-relaxed dark:text-slate-400">
                    {log.details}
                  </p>
                  <div className="mt-1 text-[10px] font-semibold text-slate-400">
                    Triggered by: {log.user}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
