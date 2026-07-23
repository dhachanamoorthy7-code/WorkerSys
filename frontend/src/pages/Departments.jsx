import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import { Building2, Star, Percent, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../components/ui/Badge";

export const Departments = () => {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await api.departments.getAll();
      setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (name) => {
    setExpandedDept((prev) => (prev === name ? null : name));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("departments")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Departmental breakdown, workforce allocations, and performance ratios.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => {
          const isExpanded = expandedDept === dept.name;
          return (
            <Card key={dept.name} className="p-5 flex flex-col justify-between">
              {/* Top Title & Total */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-650 dark:bg-blue-950/20 dark:text-blue-400">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-450">
                        {dept.totalWorkers} registered workers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(dept.name)}
                    className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>

                {/* Aggregated Stats Row */}
                <div className="grid grid-cols-3 gap-2.5 mt-4 text-center">
                  <div className="rounded-xl bg-slate-50/50 p-2.5 dark:bg-slate-900/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active
                    </span>
                    <span className="mt-1 font-extrabold text-slate-800 dark:text-white block">
                      {dept.activeWorkers}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50/50 p-2.5 dark:bg-slate-900/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Leave
                    </span>
                    <span className="mt-1 font-extrabold text-slate-800 dark:text-white block">
                      {dept.leaveWorkers}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50/50 p-2.5 dark:bg-slate-900/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Idle / Break
                    </span>
                    <span className="mt-1 font-extrabold text-slate-800 dark:text-white block">
                      {dept.idleWorkers}
                    </span>
                  </div>
                </div>

                {/* Performance & Attendance Ratio */}
                <div className="flex items-center justify-between mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-100 pt-3.5 dark:border-slate-850">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span>
                      Avg Rating: <strong>{dept.avgPerformance} / 5.0</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Percent size={14} className="text-emerald-500" />
                    <span>
                      Attendance Rate: <strong>{dept.attendanceRate}%</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsed Workers List */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850 text-xs">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Employees Assigned
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {dept.workersList.length === 0 ? (
                      <p className="text-slate-550 italic">
                        No workers currently allocated.
                      </p>
                    ) : (
                      dept.workersList.map((worker) => (
                        <div
                          key={worker.id}
                          className="flex items-center justify-between border-b border-slate-50 pb-1.5 last:border-b-0 dark:border-slate-855"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-white">
                              {worker.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-1 ml-1 rounded">
                              {worker.id}
                            </span>
                            <p className="text-[10px] text-slate-450 mt-0.5">
                              {worker.designation}
                            </p>
                          </div>
                          <Badge status={worker.status} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
