import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  Building2,
  FileBarChart,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export const Sidebar = ({ isOpen, setIsOpen, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    {
      path: "/",
      label: "Home Portal",
      icon: HomeIcon,
      roles: ["Admin", "HR", "Supervisor"],
    },
    {
      path: "/app/dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard,
      roles: ["Admin", "HR", "Supervisor"],
    },
    {
      path: "/app/workers",
      label: t("workers"),
      icon: Users,
      roles: ["Admin", "HR", "Supervisor"],
    },
    {
      path: "/app/attendance",
      label: t("attendance"),
      icon: Calendar,
      roles: ["Admin", "HR", "Supervisor"],
    },
    {
      path: "/app/status-board",
      label: t("statusBoard"),
      icon: Activity,
      roles: ["Admin", "HR", "Supervisor"],
    },
    {
      path: "/app/departments",
      label: t("departments"),
      icon: Building2,
      roles: ["Admin", "HR", "Supervisor"],
    },
    {
      path: "/app/reports",
      label: t("reports"),
      icon: FileBarChart,
      roles: ["Admin", "HR", "Supervisor"],
    },
    {
      path: "/app/admin",
      label: t("adminPanel"),
      icon: ShieldAlert,
      roles: ["Admin"],
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/40 dark:bg-slate-900/80 lg:static lg:z-30
          ${isOpen ? "w-64" : "w-20"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div>
          {/* Logo / Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-800/40">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30">
                <Activity size={20} className="animate-pulse" />
              </div>
              {isOpen && (
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight dark:from-blue-400 dark:to-indigo-400 whitespace-nowrap">
                  WorkerSys
                </span>
              )}
            </div>

            {/* Collapse Toggle (Desktop) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400"
            >
              {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 p-4">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-350 dark:hover:bg-slate-800/50 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={`shrink-0 transition-transform group-hover:scale-105 duration-200`}
                  />

                  {isOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile / Logout */}
        <div className="border-t border-slate-200/50 p-4 dark:border-slate-800/40">
          {isOpen && user && (
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm text-slate-850 dark:text-slate-100 truncate">
                  {user.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/20`}
          >
            <LogOut size={20} className="shrink-0" />
            {isOpen && <span>{t("logout")}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
