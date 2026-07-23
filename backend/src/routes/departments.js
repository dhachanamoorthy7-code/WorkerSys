import { Router } from "express";
import { getDatabase } from "../db/db.js";

const router = Router();

// GET /api/departments - Get departments with analytical metrics
router.get("/", (req, res) => {
  const db = getDatabase();
  const departments = db.departments;
  const workers = db.workers;
  const attendance = db.attendance;

  const todayStr = new Date().toISOString().split("T")[0];

  const results = departments.map((dept) => {
    const deptWorkers = workers.filter((w) => w.department === dept);
    const totalWorkers = deptWorkers.length;
    // Status breakdowns
    const activeWorkers = deptWorkers.filter(
      (w) =>
        w.status === "Active" ||
        w.status === "Working" ||
        w.status === "Overtime" ||
        w.status === "Night Shift",
    ).length;
    const idleWorkers = deptWorkers.filter(
      (w) => w.status === "Idle" || w.status === "On Break",
    ).length;
    const leaveWorkers = deptWorkers.filter(
      (w) =>
        w.status === "Leave" ||
        w.status === "Sick Leave" ||
        w.status === "Vacation",
    ).length;
    const inactiveWorkers = deptWorkers.filter(
      (w) => w.status === "Inactive" || w.status === "Completed Shift",
    ).length;

    // Performance rating average
    const ratings = deptWorkers
      .map((w) => w.performanceRating)
      .filter((r) => r > 0);
    const avgPerformance =
      ratings.length > 0
        ? Number(
            (
              ratings.reduce((sum, val) => sum + val, 0) / ratings.length
            ).toFixed(2),
          )
        : 5.0;

    // Attendance percentage (last 30 days of records for workers in this department)
    const deptWorkerIds = new Set(deptWorkers.map((w) => w.id));
    const deptAttendance = attendance.filter((a) =>
      deptWorkerIds.has(a.workerId),
    );
    const presentRecords = deptAttendance.filter(
      (a) =>
        a.status === "Present" ||
        a.status === "Overtime" ||
        a.status === "Late Entry" ||
        a.status === "Half Day",
    ).length;
    const totalRecords = deptAttendance.length;
    const attendanceRate =
      totalRecords > 0
        ? Number(((presentRecords / totalRecords) * 100).toFixed(1))
        : 100.0;

    return {
      name: dept,
      totalWorkers,
      activeWorkers,
      idleWorkers,
      leaveWorkers,
      inactiveWorkers,
      avgPerformance,
      attendanceRate,
      workersList: deptWorkers.map((w) => ({
        id: w.id,
        name: w.name,
        designation: w.designation,
        status: w.status,
      })),
    };
  });

  res.json(results);
});

export default router;
