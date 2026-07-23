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

// GET /api/attendance - Get attendance records for a specific date
router.get("/", (req, res) => {
  const db = getDatabase();
  const { date, workerId } = req.query;

  let records = [...db.attendance];

  if (date) {
    records = records.filter((r) => r.date === date);
  }

  if (workerId) {
    records = records.filter((r) => r.workerId === workerId);
  }

  res.json(records);
});

// POST /api/attendance/mark - Mark or edit attendance
router.post("/mark", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { workerId, date, status, checkIn, checkOut, overtimeHours, comments } =
    req.body;

  if (!workerId || !date || !status) {
    return res
      .status(400)
      .json({ error: "workerId, date, and status are required" });
  }

  const db = getDatabase();
  const worker = db.workers.find((w) => w.id === workerId);
  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  // Find or create record
  const existingIdx = db.attendance.findIndex(
    (a) => a.workerId === workerId && a.date === date,
  );

  let lateEntryMinutes = 0;
  if (status === "Late Entry" || (checkIn && checkIn !== "--:--")) {
    // If shift starts at 08:00 AM or 09:00 AM, calculate late entry minutes roughly
    const shiftStartHour = worker.shiftTiming.includes("09:00") ? 9 : 8;
    try {
      const parts = checkIn.split(" ");
      const timeParts = parts[0].split(":");
      const hr = parseInt(timeParts[0]);
      const min = parseInt(timeParts[1]);
      const isPM = parts[1] === "PM";
      let checkInHour = isPM && hr !== 12 ? hr + 12 : hr;
      if (!isPM && hr === 12) checkInHour = 0;
      const checkInMinutes = checkInHour * 60 + min;
      const shiftStartMinutes = shiftStartHour * 60;
      if (checkInMinutes > shiftStartMinutes) {
        lateEntryMinutes = checkInMinutes - shiftStartMinutes;
      }
    } catch (e) {
      // ignore parsing errors, default to 0 or 15 mins
      if (status === "Late Entry") lateEntryMinutes = 15;
    }
  }

  const newRecord = {
    id:
      existingIdx !== -1 ? db.attendance[existingIdx].id : `att-${Date.now()}`,
    workerId,
    date,
    status,
    checkIn: checkIn || "--:--",
    checkOut: checkOut || "--:--",
    overtimeHours: overtimeHours ? Number(overtimeHours) : 0,
    lateEntryMinutes,
    comments: comments || "",
    lastUpdated: new Date().toISOString(),
  };

  // Sync worker status depending on attendance status
  if (date === new Date().toISOString().split("T")[0]) {
    if (status === "Absent") worker.status = "Inactive";
    else if (status === "Leave") worker.status = "Leave";
    else if (status === "Present" || status === "Late Entry")
      worker.status = "Working";
    else if (status === "Overtime") worker.status = "Overtime";
  }

  if (existingIdx !== -1) {
    db.attendance[existingIdx] = newRecord;
  } else {
    db.attendance.push(newRecord);
  }

  saveDatabase(db);
  logActivity(
    user.email,
    "Attendance Marked",
    `Marked ${worker.name} (${workerId}) as ${status} on ${date}.`,
  );

  res.json(newRecord);
});

// POST /api/attendance/scan-qr - QR Attendance check-in/out
router.post("/scan-qr", (req, res) => {
  const { workerId } = req.body;
  if (!workerId) {
    return res.status(400).json({ error: "Worker ID is required" });
  }

  const db = getDatabase();
  const worker = db.workers.find((w) => w.id === workerId);
  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const timeStr = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const existingIdx = db.attendance.findIndex(
    (a) => a.workerId === workerId && a.date === todayStr,
  );

  if (existingIdx !== -1) {
    // Check-out
    const rec = db.attendance[existingIdx];
    rec.checkOut = timeStr;
    rec.status = rec.status === "Overtime" ? "Overtime" : "Present";
    rec.lastUpdated = new Date().toISOString();
    worker.status = "Completed Shift";
    saveDatabase(db);
    logActivity(
      "qr-scanner@system.com",
      "QR Check-out",
      `${worker.name} (${workerId}) checked out via QR.`,
    );
    return res.json({ message: "Checked out successfully", record: rec });
  } else {
    // Check-in
    const rec = {
      id: `att-${Date.now()}`,
      workerId,
      date: todayStr,
      status: "Present",
      checkIn: timeStr,
      checkOut: "--:--",
      overtimeHours: 0,
      lateEntryMinutes: 0,
      lastUpdated: new Date().toISOString(),
    };
    db.attendance.push(rec);
    worker.status = "Working";
    saveDatabase(db);
    logActivity(
      "qr-scanner@system.com",
      "QR Check-in",
      `${worker.name} (${workerId}) checked in via QR.`,
    );
    return res.json({ message: "Checked in successfully", record: rec });
  }
});

// POST /api/attendance/scan-face - Face Recognition Attendance
router.post("/scan-face", (req, res) => {
  const { workerId, confidence } = req.body;
  if (!workerId) {
    return res.status(400).json({ error: "Worker ID is required" });
  }

  const db = getDatabase();
  const worker = db.workers.find((w) => w.id === workerId);
  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const timeStr = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const existingIdx = db.attendance.findIndex(
    (a) => a.workerId === workerId && a.date === todayStr,
  );

  if (existingIdx !== -1) {
    // Check-out
    const rec = db.attendance[existingIdx];
    rec.checkOut = timeStr;
    rec.lastUpdated = new Date().toISOString();
    worker.status = "Completed Shift";
    saveDatabase(db);
    logActivity(
      "face-scanner@system.com",
      "Face Check-out",
      `${worker.name} (${workerId}) checked out via Face Recognition (${confidence}% confidence).`,
    );
    return res.json({
      message: "Checked out successfully (Face)",
      record: rec,
    });
  } else {
    // Check-in
    const rec = {
      id: `att-${Date.now()}`,
      workerId,
      date: todayStr,
      status: "Present",
      checkIn: timeStr,
      checkOut: "--:--",
      overtimeHours: 0,
      lateEntryMinutes: 0,
      lastUpdated: new Date().toISOString(),
    };
    db.attendance.push(rec);
    worker.status = "Working";
    saveDatabase(db);
    logActivity(
      "face-scanner@system.com",
      "Face Check-in",
      `${worker.name} (${workerId}) checked in via Face Recognition (${confidence}% confidence).`,
    );
    return res.json({ message: "Checked in successfully (Face)", record: rec });
  }
});

// GET /api/attendance/leaves - Leave Requests
router.get("/leaves", (req, res) => {
  const db = getDatabase();
  res.json(db.leaveRequests);
});

// POST /api/attendance/leaves - File a Leave Request
router.post("/leaves", (req, res) => {
  const { workerId, startDate, endDate, type, reason } = req.body;
  if (!workerId || !startDate || !endDate || !type) {
    return res
      .status(400)
      .json({ error: "workerId, startDate, endDate, and type are required" });
  }

  const db = getDatabase();
  const worker = db.workers.find((w) => w.id === workerId);
  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  const newRequest = {
    id: `leave-${Date.now()}`,
    workerId,
    workerName: worker.name,
    workerDept: worker.department,
    startDate,
    endDate,
    type,
    reason: reason || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  db.leaveRequests.push(newRequest);

  // Add Notification
  const newNotif = {
    id: `notif-${Date.now()}`,
    title: "New Leave Request",
    message: `${worker.name} (${worker.department}) has requested leave from ${startDate} to ${endDate}.`,
    type: "leave",
    timestamp: new Date().toISOString(),
    read: false,
  };
  db.notifications.unshift(newNotif);

  saveDatabase(db);
  logActivity(
    "system@system.com",
    "Leave Request Filed",
    `Leave request submitted for ${worker.name} (${workerId}).`,
  );

  res.status(201).json(newRequest);
});

// PATCH /api/attendance/leaves/:id - Approve or Reject Leave Request
router.patch("/leaves/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== "Admin" && user.role !== "HR")) {
    return res
      .status(403)
      .json({ error: "Unauthorized. Admin or HR role required." });
  }

  const { id } = req.params;
  const { status } = req.body; // Approved or Rejected

  if (!status || (status !== "Approved" && status !== "Rejected")) {
    return res
      .status(400)
      .json({ error: "Valid status (Approved or Rejected) is required." });
  }

  const db = getDatabase();
  const leaveIdx = db.leaveRequests.findIndex((l) => l.id === id);
  if (leaveIdx === -1) {
    return res.status(404).json({ error: "Leave request not found" });
  }

  const leave = db.leaveRequests[leaveIdx];
  leave.status = status;

  if (status === "Approved") {
    // Automatically flag active attendance for that range as Leave if they fall into dates
    const worker = db.workers.find((w) => w.id === leave.workerId);
    if (worker) {
      // Set current status if date is active
      const todayStr = new Date().toISOString().split("T")[0];
      if (todayStr >= leave.startDate && todayStr <= leave.endDate) {
        worker.status =
          leave.type === "Sick Leave"
            ? "Sick Leave"
            : leave.type === "Vacation"
              ? "Vacation"
              : "Leave";
      }
    }
  }

  saveDatabase(db);
  logActivity(
    user.email,
    `Leave ${status}`,
    `${status} leave request for ${leave.workerName} (${leave.workerId}).`,
  );

  res.json(leave);
});

export default router;
