import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Search, RefreshCw, Layers } from "lucide-react";

export const WorkerStatusBoard = () => {
  const { t } = useLanguage();
  const { hasRole } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const departmentsList = [
    "Production",
    "Packing",
    "Quality",
    "Maintenance",
    "HR",
    "Security",
    "Warehouse",
    "Administration",
  ];

  useEffect(() => {
    fetchStatusBoard();
  }, [deptFilter, search]);

  const fetchStatusBoard = async () => {
    try {
      setLoading(true);
      const data = await api.workers.getAll({
        search,
        department: deptFilter,
      });
      setWorkers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (workerId, newStatus) => {
    setUpdatingId(workerId);
    try {
      const updated = await api.workers.update(workerId, { status: newStatus });
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === workerId ? { ...w, status: updated.status } : w,
        ),
      );
    } catch (err) {
      alert(err.message || "Status update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("statusBoard")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Instantly update and monitor real-time worker statuses.
          </p>
        </div>
        <button
          onClick={fetchStatusBoard}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-805 dark:bg-slate-900 dark:text-slate-350"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Reload Board
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute inset-y-0 left-3 top-3 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search workers on shift..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-805 dark:bg-slate-950"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Layers size={14} className="text-slate-450" />
          <span className="text-xs font-semibold text-slate-550">
            Filter Department:
          </span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-805 dark:bg-slate-950"
          >
            <option value="All">All Departments</option>
            {departmentsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Status Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          </div>
        ) : workers.length === 0 ? (
          <Card className="col-span-full p-8 text-center text-slate-500">
            No workers found matching your inputs.
          </Card>
        ) : (
          workers.map((w) => (
            <Card key={w.id} className="p-5 flex flex-col justify-between h-52">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      {w.name}
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {w.id}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-450 mt-0.5">
                      {w.designation}
                    </p>
                  </div>
                  <Badge status={w.status} />
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  {w.department} • {w.shiftTiming}
                </div>
              </div>

              {/* Status Update Buttons (Visible only if Admin / HR / Supervisor) */}
              {hasRole(["Admin", "HR", "Supervisor"]) ? (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Set Live Status
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      "Active",
                      "Working",
                      "Idle",
                      "On Break",
                      "Leave",
                      "Overtime",
                    ].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(w.id, st)}
                        disabled={updatingId === w.id}
                        className={`rounded px-2 py-1 text-[9px] font-bold transition-all
                          ${
                            w.status === st
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700"
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-105 text-[10px] text-slate-400 dark:border-slate-850 italic">
                  Read-only view. Ask an Admin or Supervisor to modify statuses.
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
