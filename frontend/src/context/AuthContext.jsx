import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("worker_sys_token");
    const savedUser = localStorage.getItem("worker_sys_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Clear corrupt storage
        localStorage.removeItem("worker_sys_token");
        localStorage.removeItem("worker_sys_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(credentials);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("worker_sys_token", data.token);
      localStorage.setItem("worker_sys_user", JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("worker_sys_token");
    localStorage.removeItem("worker_sys_user");
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
