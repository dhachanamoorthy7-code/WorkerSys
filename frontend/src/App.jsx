import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { WorkerManagement } from "./pages/WorkerManagement";
import { AttendanceManagement } from "./pages/AttendanceManagement";
import { WorkerStatusBoard } from "./pages/WorkerStatusBoard";
import { Departments } from "./pages/Departments";
import { Reports } from "./pages/Reports";
import { AdminPanel } from "./pages/AdminPanel";

export const App = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Access */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* Private Auth Layout */}
              <Route path="/app" element={<Layout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="workers" element={<WorkerManagement />} />
                <Route path="attendance" element={<AttendanceManagement />} />
                <Route path="status-board" element={<WorkerStatusBoard />} />
                <Route path="departments" element={<Departments />} />
                <Route path="reports" element={<Reports />} />
                <Route path="admin" element={<AdminPanel />} />
              </Route>

              {/* Catch All Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
