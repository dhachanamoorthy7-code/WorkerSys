import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Activity, Mail, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { Card } from "../components/ui/Card";
import { api } from "../services/api";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [viewMode, setViewMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Signup states
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState("Supervisor");

  // Email verification mock states
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.signup({
        name: signupName,
        email,
        password,
        role: signupRole,
      });
      // Auto login upon successful registration
      await login({ email, password });
      navigate("/app");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/app");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      setMessage(res.message);
      setVerifyEmail(email);
      setTimeout(() => {
        setViewMode("verify");
      }, 1500);
    } catch (err) {
      setError(err.message || "Error executing request.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.auth.verifyEmail(verifyEmail, verifyCode);
      setMessage(res.message);
      setTimeout(() => {
        setEmail(verifyEmail);
        setViewMode("login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    setEmail(`${role}@system.com`);
    setPassword(`${role}123`);
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-white px-4 transition-colors duration-300 dark:bg-slate-950">
      {/* Dynamic particles mockup background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-400 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-indigo-400 blur-3xl" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <Activity size={24} className="animate-pulse" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            WorkerSys
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Worker Status Management System
          </p>
        </div>

        <Card className="shadow-2xl border-white/50 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
              {message}
            </div>
          )}

          {viewMode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setViewMode("forgot")}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/30 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span>Logging in...</span>
                    <span className="text-[10px] text-blue-200 font-normal normal-case">
                      (Cold start: free server takes ~50s to wake up)
                    </span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Quick Login Shortcuts */}
              <div className="mt-6 border-t border-slate-200/50 pt-4 dark:border-slate-800/40">
                <p className="text-center text-xs font-medium text-slate-400">
                  Quick-fill Demo Roles
                </p>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin")}
                    className="flex flex-col items-center justify-center rounded-lg border border-slate-200/60 bg-slate-50/50 py-2 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800"
                  >
                    <Shield size={14} className="text-blue-500" />
                    <span className="mt-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      Admin
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("hr")}
                    className="flex flex-col items-center justify-center rounded-lg border border-slate-200/60 bg-slate-50/50 py-2 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800"
                  >
                    <Shield size={14} className="text-indigo-500" />
                    <span className="mt-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      HR
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("supervisor")}
                    className="flex flex-col items-center justify-center rounded-lg border border-slate-200/60 bg-slate-50/50 py-2 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800"
                  >
                    <Shield size={14} className="text-emerald-500" />
                    <span className="mt-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      Supervisor
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setEmail("");
                    setPassword("");
                    setViewMode("signup");
                  }}
                  className="text-xs font-semibold text-blue-500 hover:underline"
                >
                  Don't have an account? Sign Up
                </button>
              </div>
            </form>
          )}

          {viewMode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Create Account
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Security Role
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="HR">HR Manager</option>
                  <option value="Supervisor">
                    Supervisor (Operations Only)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span>Creating Account...</span>
                    <span className="text-[10px] text-blue-200 font-normal normal-case">
                      (Cold start: free server takes ~50s to wake up)
                    </span>
                  </div>
                ) : (
                  "Register"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setViewMode("login");
                  }}
                  className="text-xs font-semibold text-blue-500 hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}

          {viewMode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Reset Password
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your registered email address and we'll send you a
                password recovery code.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode("login")}
                  className="w-1/2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700"
                >
                  {loading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          )}

          {viewMode === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">
                Email Verification
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We've sent a 6-digit confirmation code to{" "}
                <strong>{verifyEmail}</strong>. Enter it below to complete
                verification.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) =>
                    setVerifyCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/50 py-3 text-center text-lg font-bold tracking-[0.75em] outline-none transition-all focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("login")}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 hover:underline"
              >
                Cancel and return
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
