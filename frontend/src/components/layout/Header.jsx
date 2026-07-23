import React, { useState, useEffect } from "react";
import { Menu, Bell, Sun, Moon, Globe, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";

export const Header = ({ setMobileOpen }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.admin.getNotifications();
      setNotifications(data);
      setIsOnline(true);
    } catch (e) {
      // Simulate offline mode if fetch fails
      setIsOnline(false);
    }
  };

  const toggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      await api.admin.markNotificationRead(n.id);
    }
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/50 bg-white/70 px-6 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/80">
      {/* Left: Mobile Toggle & Welcome */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-650 dark:hover:bg-slate-800 dark:text-slate-350 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-150">
            {user ? `Welcome back, ${user.name}` : "Worker Status System"}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Offline Simulation Switcher */}
        <button
          onClick={toggleOnline}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-all duration-200
            ${
              isOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30"
            }`}
          title={
            isOnline
              ? "Server Status: Connected"
              : "Server Status: Mock Offline Mode"
          }
        >
          {isOnline ? (
            <>
              <Wifi size={14} className="text-emerald-500" />
              <span className="hidden md:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-amber-500" />
              <span className="hidden md:inline">Offline Mode</span>
            </>
          )}
        </button>

        {/* Language Selector */}
        <div className="relative group">
          <button className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300">
            <Globe size={18} />
          </button>
          <div className="absolute right-0 mt-1 hidden w-32 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg group-hover:block dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setLanguage("en")}
              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${language === "en" ? "text-blue-500" : "text-slate-600 dark:text-slate-400"}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${language === "es" ? "text-blue-500" : "text-slate-600 dark:text-slate-400"}`}
            >
              Español
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${language === "hi" ? "text-blue-500" : "text-slate-600 dark:text-slate-400"}`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-350"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative rounded-lg p-2 hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between border-b border-slate-200/60 px-4 py-3 dark:border-slate-850">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  Notifications
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                    No notifications
                  </p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`flex flex-col p-2.5 rounded-xl transition-colors duration-150
                        ${
                          n.read
                            ? "bg-transparent text-slate-500 dark:text-slate-400"
                            : "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
