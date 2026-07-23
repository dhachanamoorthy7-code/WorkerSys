import { Router } from "express";
import { getDatabase, saveDatabase, logActivity } from "../db/db.js";

const router = Router();

const getAuthUser = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    const base64 = authHeader.split(" ")[1];
    return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
  } catch (e) {
    return null;
  }
};

// GET /api/admin/logs - Fetch audit logs
router.get("/logs", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "Admin") {
    return res
      .status(403)
      .json({ error: "Unauthorized. Admin access required." });
  }
  const db = getDatabase();
  res.json(db.auditLogs);
});

// GET /api/admin/notifications - Fetch system notifications
router.get("/notifications", (req, res) => {
  const db = getDatabase();
  res.json(db.notifications);
});

// POST /api/admin/notifications/:id/read - Mark notification as read
router.post("/notifications/:id/read", (req, res) => {
  const db = getDatabase();
  const index = db.notifications.findIndex((n) => n.id === req.params.id);
  if (index !== -1) {
    db.notifications[index].read = true;
    saveDatabase(db);
  }
  res.json({ success: true });
});

// GET /api/admin/backup - Download DB Backup JSON
router.get("/backup", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "Admin") {
    return res
      .status(403)
      .json({ error: "Unauthorized. Admin access required." });
  }
  const db = getDatabase();
  logActivity(
    user.email,
    "Database Backup",
    "System database backup exported by Admin.",
  );
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=worker_db_backup.json",
  );
  res.send(JSON.stringify(db, null, 2));
});

// POST /api/admin/restore - Restore DB from JSON upload
router.post("/restore", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "Admin") {
    return res
      .status(403)
      .json({ error: "Unauthorized. Admin access required." });
  }

  const backupData = req.body;
  if (!backupData.users || !backupData.workers || !backupData.attendance) {
    return res.status(400).json({ error: "Invalid database backup format." });
  }

  saveDatabase(backupData);
  logActivity(
    user.email,
    "Database Restore",
    "System database restored successfully.",
  );
  res.json({ message: "Database restored successfully." });
});

// GET /api/admin/analytics - Retrieve dashboard analytics & chart data
router.get("/analytics", (req, res) => {
  const db = getDatabase();
  const workers = db.workers;
  const attendance = db.attendance;

  const totalWorkers = workers.length;
  // Counts
  const activeWorkers = workers.filter(
    (w) =>
      w.status === "Active" ||
      w.status === "Working" ||
      w.status === "Overtime" ||
      w.status === "Night Shift",
  ).length;
  const onLeave = workers.filter(
    (w) =>
      w.status === "Leave" ||
      w.status === "Sick Leave" ||
      w.status === "Vacation",
  ).length;

  const absent = workers.filter((w) => w.status === "Inactive").length;
  const overtimeWorkers = workers.filter((w) => w.status === "Overtime").length;

  // New workers this month
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const newWorkersThisMonth = workers.filter((w) =>
    w.dateOfJoining.startsWith(currentMonthStr),
  ).length;

  // Today's attendance percentage
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayRecords.filter(
    (r) =>
      r.status === "Present" ||
      r.status === "Overtime" ||
      r.status === "Late Entry" ||
      r.status === "Half Day",
  ).length;
  const attendancePercentage =
    totalWorkers > 0 ? Math.round((presentCount / totalWorkers) * 100) : 100;

  // 1. Attendance Trend (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const attendanceTrend = last7Days.map((dateStr) => {
    const dayRecords = attendance.filter((a) => a.date === dateStr);
    const dayP = dayRecords.filter(
      (r) =>
        r.status === "Present" ||
        r.status === "Overtime" ||
        r.status === "Late Entry" ||
        r.status === "Half Day",
    ).length;
    // In our seed, some days might have no records; if so, default to high attendance
    const rate =
      dayRecords.length > 0 ? Math.round((dayP / dayRecords.length) * 100) : 90;
    // Format date as Month Day (e.g. Jul 20)
    const [year, month, day] = dateStr.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const label = `${monthNames[parseInt(month) - 1]} ${day}`;

    return { date: label, rate };
  });

  // 2. Department-wise Workers Count
  const departmentWorkers = db.departments.map((dept) => {
    const count = workers.filter((w) => w.department === dept).length;
    return { name: dept, value: count };
  });

  // 3. Worker Status Distribution
  const statusCounts = workers.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const workerStatusPie = Object.entries(statusCounts).map(
    ([status, count]) => ({
      name: status,
      value: count,
    }),
  );

  // 4. Overtime statistics (Sum of overtime hours per department for the current month)
  const overtimeStats = db.departments.map((dept) => {
    const deptWorkerIds = new Set(
      workers.filter((w) => w.department === dept).map((w) => w.id),
    );
    const deptOvertime = attendance
      .filter(
        (a) =>
          deptWorkerIds.has(a.workerId) && a.date.startsWith(currentMonthStr),
      )
      .reduce((sum, curr) => sum + (curr.overtimeHours || 0), 0);

    return { name: dept, hours: deptOvertime };
  });

  res.json({
    metrics: {
      totalWorkers,
      activeWorkers,
      onLeave,
      absent,
      overtimeWorkers,
      newWorkersThisMonth,
      attendancePercentage,
    },
    charts: {
      attendanceTrend,
      departmentWorkers,
      workerStatusPie,
      overtimeStats,
    },
  });
});

export default router;
