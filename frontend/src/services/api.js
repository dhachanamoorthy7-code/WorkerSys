const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("worker_sys_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const api = {
  // Auth API
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });
      return handleResponse(res);
    },
    signup: async (data) => {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    forgotPassword: async (email) => {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return handleResponse(res);
    },
    verifyEmail: async (email, code) => {
      const res = await fetch(`${BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, code }),
      });
      return handleResponse(res);
    },
  },

  // Workers API
  workers: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.department) params.append("department", filters.department);
      if (filters.status) params.append("status", filters.status);

      const res = await fetch(`${BASE_URL}/workers?${params.toString()}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getOne: async (id) => {
      const res = await fetch(`${BASE_URL}/workers/${id}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${BASE_URL}/workers`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${BASE_URL}/workers/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${BASE_URL}/workers/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Attendance API
  attendance: {
    get: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.date) params.append("date", filters.date);
      if (filters.workerId) params.append("workerId", filters.workerId);

      const res = await fetch(`${BASE_URL}/attendance?${params.toString()}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    mark: async (data) => {
      const res = await fetch(`${BASE_URL}/attendance/mark`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    scanQR: async (workerId) => {
      const res = await fetch(`${BASE_URL}/attendance/scan-qr`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ workerId }),
      });
      return handleResponse(res);
    },
    scanFace: async (workerId, confidence) => {
      const res = await fetch(`${BASE_URL}/attendance/scan-face`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ workerId, confidence }),
      });
      return handleResponse(res);
    },
    getLeaves: async () => {
      const res = await fetch(`${BASE_URL}/attendance/leaves`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    createLeave: async (data) => {
      const res = await fetch(`${BASE_URL}/attendance/leaves`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    updateLeave: async (id, status) => {
      const res = await fetch(`${BASE_URL}/attendance/leaves/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
  },

  // Departments API
  departments: {
    getAll: async () => {
      const res = await fetch(`${BASE_URL}/departments`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Admin API
  admin: {
    getLogs: async () => {
      const res = await fetch(`${BASE_URL}/admin/logs`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getNotifications: async () => {
      const res = await fetch(`${BASE_URL}/admin/notifications`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    markNotificationRead: async (id) => {
      const res = await fetch(`${BASE_URL}/admin/notifications/${id}/read`, {
        method: "POST",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getAnalytics: async () => {
      const res = await fetch(`${BASE_URL}/admin/analytics`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getBackupUrl: () => {
      const token = localStorage.getItem("worker_sys_token") || "";
      return `${BASE_URL}/admin/backup?authorization=Bearer+${token}`;
    },
    restoreDb: async (dbContent) => {
      const res = await fetch(`${BASE_URL}/admin/restore`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(dbContent),
      });
      return handleResponse(res);
    },
  },
};
