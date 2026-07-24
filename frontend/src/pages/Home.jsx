import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const Home = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("worker_sys_token");
    const savedUser = localStorage.getItem("worker_sys_user");
    if (savedToken && savedUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate("/app");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 flex flex-col justify-between overflow-x-hidden">
      {/* Top Navbar */}
      <header className="mx-auto w-full max-w-7xl px-6 h-16 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Activity size={20} className="animate-pulse" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            WorkerSys
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Basic Hero Area */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight text-slate-900 dark:text-white">
            Welcome to WorkerSys
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A basic and easy-to-use system to manage employee databases, log check-in/out attendance records, and monitor live worker shift statuses.
          </p>
        </div>

        {/* The Basics List */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 rounded-2xl p-6 text-left shadow-sm space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform Basics:
          </h3>
          <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-350 list-disc list-inside">
            <li>Manage worker personnel profiles and rosters.</li>
            <li>Simulate attendance checking via Face Scan or QR Codes.</li>
            <li>Track live active, break, idle, and leave states.</li>
            <li>Export reports to CSV and manage database backups.</li>
          </ul>
        </div>

        <button
          onClick={handleCTA}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 text-sm font-semibold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
        >
          {isLoggedIn ? "Enter Dashboard" : "Launch Application"}
          <ArrowRight size={16} />
        </button>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/40 py-6 text-center text-xs text-slate-450 dark:text-slate-500">
        <p>© {new Date().getFullYear()} WorkerSys. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
