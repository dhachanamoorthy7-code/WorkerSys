import React from "react";

export const Badge = ({ status }) => {
  const getColors = (stat) => {
    switch (stat) {
      // Green = Active/Present
      case "Active":
      case "Present":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      // Blue = Working
      case "Working":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
      // Orange = On Break / Idle / Half Day
      case "On Break":
      case "Idle":
      case "Half Day":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30";
      // Yellow = Leaves
      case "Leave":
      case "Sick Leave":
      case "Vacation":
        return "bg-yellow-50 text-yellow-750 border-yellow-250 dark:bg-yellow-950/20 dark:text-yellow-450 dark:border-yellow-900/30";
      // Red = Absent / Inactive
      case "Absent":
      case "Inactive":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30";
      // Purple = Overtime / Night Shift / Completed Shift / Late Entry
      case "Overtime":
      case "Night Shift":
      case "Completed Shift":
      case "Late Entry":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${getColors(status)}`}
    >
      {status}
    </span>
  );
};
