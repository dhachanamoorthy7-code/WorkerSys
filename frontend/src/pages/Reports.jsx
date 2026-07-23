import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Layers,
  Filter,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";

export const Reports = () => {
  const { t } = useLanguage();
  const [reportType, setReportType] = useState("attendance");
  const [timeframe, setTimeframe] = useState("daily");
  const [department, setDepartment] = useState("All");
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

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
    fetchReportData();
  }, [reportType, timeframe, department, reportDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const workersData = await api.workers.getAll({ department });
      const attData = await api.attendance.get();
      const leavesData = await api.attendance.getLeaves();
      setWorkers(workersData);
      setAttendance(attData);
      setLeaves(leavesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Compile Report Rows based on reportType
  const getReportRows = () => {
    switch (reportType) {
      case "attendance":
        return workers.map((w) => {
          const att = attendance.find(
            (a) => a.workerId === w.id && a.date === reportDate,
          );
          return {
            id: w.id,
            name: w.name,
            department: w.department,
            designation: w.designation,
            status: att ? att.status : "Absent/Not Clocked",
            checkIn: att ? att.checkIn : "--:--",
            checkOut: att ? att.checkOut : "--:--",
          };
        });

      case "performance":
        return workers.map((w) => {
          const wAttendance = attendance.filter((a) => a.workerId === w.id);
          const present = wAttendance.filter(
            (a) =>
              a.status === "Present" ||
              a.status === "Overtime" ||
              a.status === "Late Entry" ||
              a.status === "Half Day",
          ).length;
          const rate =
            wAttendance.length > 0
              ? Math.round((present / wAttendance.length) * 100)
              : 100;
          return {
            id: w.id,
            name: w.name,
            department: w.department,
            designation: w.designation,
            attendanceRate: `${rate}%`,
            rating: w.performanceRating,
            status:
              rate >= 90
                ? "Excellent"
                : rate >= 75
                  ? "Good"
                  : "Needs Improvement",
          };
        });

      case "overtime":
        return workers.map((w) => {
          const wAttendance = attendance.filter((a) => a.workerId === w.id);
          const otHours = wAttendance.reduce(
            (sum, curr) => sum + (curr.overtimeHours || 0),
            0,
          );
          return {
            id: w.id,
            name: w.name,
            department: w.department,
            designation: w.designation,
            overtimeHours: `${otHours} hrs`,
            overtimePay: `$${(otHours * 25).toLocaleString()}`, // mock rate
          };
        });

      case "leave":
        return leaves
          .filter((l) => department === "All" || l.workerDept === department)
          .map((l) => ({
            id: l.workerId,
            name: l.workerName,
            department: l.workerDept,
            type: l.type,
            dates: `${l.startDate} to ${l.endDate}`,
            reason: l.reason,
            status: l.status,
          }));
    }
  };

  const rows = getReportRows();

  // Export to CSV helper
  const handleExportCSV = () => {
    if (rows.length === 0) return;
    // Get headers based on keys of first row
    const headers = Object.keys(rows[0]).map((h) => h.toUpperCase());
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        Object.values(row)
          .map((val) => `"${val.toString().replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType}_report_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("reports")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate logs, overtime listings, and performance exports.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-805 dark:bg-slate-900 dark:text-slate-350"
          >
            <Download size={14} />
            {t("exportCsv")}
          </button>
          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
          >
            <Printer size={14} />
            {t("exportPdf")}
          </button>
        </div>
      </div>

      {/* Filters (Hidden during browser printing) */}
      <Card className="p-4 flex flex-wrap items-center gap-4 no-print">
        {/* Report Type */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-450" />
          <span className="text-xs font-semibold text-slate-550">Report:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-805 dark:bg-slate-950"
          >
            <option value="attendance">Daily Attendance Log</option>
            <option value="performance">Worker Performance Sheet</option>
            <option value="overtime">Overtime Logs</option>
            <option value="leave">Leave Request Audit</option>
          </select>
        </div>

        {/* Timeframe */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-450" />
          <span className="text-xs font-semibold text-slate-550">
            Timeframe:
          </span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-805 dark:bg-slate-950"
          >
            <option value="daily">Daily Summary</option>
            <option value="weekly">Weekly Rollup</option>
            <option value="monthly">Monthly Aggregate</option>
          </select>
        </div>

        {/* Department */}
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-slate-450" />
          <span className="text-xs font-semibold text-slate-550">
            Department:
          </span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
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

        {/* Date Selector */}
        {reportType === "attendance" && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-450" />
            <span className="text-xs font-semibold text-slate-550">Date:</span>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-805 dark:bg-slate-950"
            />
          </div>
        )}
      </Card>

      {/* Main Print Layout Card */}
      <Card className="p-6">
        {/* Printable Report Header */}
        <div className="hidden print-only text-center border-b pb-4 mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wide">
            Workforce Status System Report
          </h2>
          <p className="text-xs text-slate-500">
            Report: {reportType} | Date Generated:{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-bold text-slate-800 dark:text-white capitalize flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            {reportType} Summary Table
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {rows.length} records found
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-semibold">
            No data records available for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 font-bold uppercase tracking-wider">
                  {Object.keys(rows[0]).map((col) => (
                    <th key={col} className="px-6 py-3.5 capitalize">
                      {col.replace(/([A-Z])/g, " $1")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/10">
                    {Object.entries(row).map(([key, val], cIdx) => (
                      <td
                        key={cIdx}
                        className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-300"
                      >
                        {key === "status" &&
                        (reportType === "attendance" ||
                          reportType === "leave") ? (
                          <Badge status={val} />
                        ) : key === "status" && val === "Excellent" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-450 font-bold">
                            <CheckCircle size={12} /> {val}
                          </span>
                        ) : key === "status" && val === "Needs Improvement" ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-450 font-bold">
                            <AlertCircle size={12} /> {val}
                          </span>
                        ) : (
                          val.toString()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
