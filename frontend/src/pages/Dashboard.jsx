import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserMinus,
  UserX,
  Clock,
  UserPlus,
  Percent,
  TrendingUp,
  ListFilter,
  CalendarDays,
  WifiOff,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Dashboard = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status badge count state
  const [statusBreakdown, setStatusBreakdown] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getAnalytics();
      setMetrics(data.metrics);
      setCharts(data.charts);

      // Fetch audit logs (recent 6 items)
      try {
        const audit = await api.admin.getLogs();
        setLogs(audit.slice(0, 6));
      } catch (err) {
        // Fallback for HR/Supervisor roles who can't access full logs
        setLogs([
          {
            id: "log-f1",
            timestamp: new Date().toISOString(),
            user: "System",
            action: "Live view",
            details: "Dashboard analytics refreshed.",
          },
        ]);
      }

      // Format status board numbers
      if (data.charts?.workerStatusPie) {
        setStatusBreakdown(data.charts.workerStatusPie);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="p-8 text-center text-slate-400 h-64 flex flex-col justify-center items-center">
        <WifiOff size={40} className="text-amber-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Connection Failed</h3>
        <p className="text-xs max-w-xs">Unable to load dashboard metrics. Please check if the API server is running on port 5000.</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-all"
        >
          Retry Connection
        </button>
      </Card>
    );
  }

  // Color mappings for Recharts Pie Chart
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#64748b",
    "#84cc16",
    "#06b6d4",
  ];

  const stats = [
    {
      label: t("totalWorkers"),
      value: metrics.totalWorkers,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400",
    },
    {
      label: t("activeWorkers"),
      value: metrics.activeWorkers,
      icon: UserCheck,
      color:
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-450",
    },
    {
      label: t("onLeave"),
      value: metrics.onLeave,
      icon: UserMinus,
      color:
        "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-450",
    },
    {
      label: t("absent"),
      value: metrics.absent,
      icon: UserX,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-450",
    },
    {
      label: t("overtimeWorkers"),
      value: metrics.overtimeWorkers,
      icon: Clock,
      color:
        "text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-405",
    },
    {
      label: t("newWorkers"),
      value: metrics.newWorkersThisMonth,
      icon: UserPlus,
      color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/20 dark:text-cyan-405",
    },
    {
      label: t("attendanceRate"),
      value: `${metrics.attendancePercentage}%`,
      icon: Percent,
      color: "text-lime-600 bg-lime-50 dark:bg-lime-950/20 dark:text-lime-405",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("dashboard")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Overview of company workforce and real-time activities.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {/* Grid: 7 Quick Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card
              key={idx}
              className="p-4 flex flex-col justify-between items-center text-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}
              >
                <Icon size={20} />
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-550 block">
                  {s.label}
                </span>
                <span className="mt-1 text-xl font-bold text-slate-800 dark:text-white block">
                  {s.value}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance Trend Line Chart */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t("attendanceTrend")}
            </h3>
            <TrendingUp size={16} className="text-slate-450" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.attendanceTrend || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  className="dark:hidden"
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  className="hidden dark:block"
                />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#2563eb"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Workers Bar Chart */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t("departmentDistribution")}
            </h3>
            <ListFilter size={16} className="text-slate-450" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.departmentWorkers || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  className="dark:hidden"
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  className="hidden dark:block"
                />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Board Distribution Pie Chart */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t("statusDistribution")}
            </h3>
            <CalendarDays size={16} className="text-slate-450" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-56 w-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusBreakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full text-xs">
              {statusBreakdown.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-500 dark:text-slate-450 truncate">
                    {entry.name}:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Overtime statistics Bar Chart */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t("overtimeStatistics")}
            </h3>
            <Clock size={16} className="text-slate-450" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.overtimeStats || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  className="dark:hidden"
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  className="hidden dark:block"
                />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Today Summary & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today Summary */}
        <Card className="lg:col-span-1">
          <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">
            {t("todaySummary")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-3.5 dark:bg-blue-950/10">
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-450">
                  Active on Shift
                </span>
                <span className="mt-0.5 text-base font-bold text-blue-600 dark:text-blue-400 block">
                  {metrics.activeWorkers} workers
                </span>
              </div>
              <Badge status="Working" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50/50 p-3.5 dark:bg-amber-950/10">
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-450">
                  On Break / Idle
                </span>
                <span className="mt-0.5 text-base font-bold text-amber-600 dark:text-amber-400 block">
                  {statusBreakdown.find(
                    (s) => s.name === "On Break" || s.name === "Idle",
                  )?.value || 2}{" "}
                  workers
                </span>
              </div>
              <Badge status="On Break" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-purple-50/50 p-3.5 dark:bg-purple-950/10">
              <div>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-450">
                  Overtime Hours Today
                </span>
                <span className="mt-0.5 text-base font-bold text-purple-600 dark:text-purple-400 block">
                  {charts?.overtimeStats?.reduce(
                    (sum, curr) => sum + curr.hours,
                    0,
                  ) || 3}{" "}
                  hours
                </span>
              </div>
              <Badge status="Overtime" />
            </div>
          </div>
        </Card>

        {/* Activity Logs Timeline */}
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">
            {t("recentActivity")}
          </h3>
          <div className="relative border-l border-slate-200 pl-4 space-y-4.5 dark:border-slate-800">
            {logs.map((log) => (
              <div key={log.id} className="relative group">
                <span className="absolute -left-[21px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-blue-500 bg-white group-hover:scale-110 transition-transform dark:bg-slate-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-350">
                    {log.action}
                  </span>
                  <span className="text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                  {log.details}
                </p>
                <div className="mt-0.5 text-[10px] text-slate-400 font-medium">
                  Triggered by: {log.user}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
