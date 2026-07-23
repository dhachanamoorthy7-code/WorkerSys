import { Router } from "express";
import { getDatabase, saveDatabase, logActivity } from "../db/db.js";

const router = Router();

// Middleware to mock authentication and check permissions
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

// GET /api/workers - Query and Filter workers
router.get("/", (req, res) => {
  const db = getDatabase();
  let results = [...db.workers];

  const { search, department, status } = req.query;

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        w.phone.toLowerCase().includes(q) ||
        w.designation.toLowerCase().includes(q),
    );
  }

  if (department && department !== "All") {
    results = results.filter((w) => w.department === department);
  }

  if (status && status !== "All") {
    results = results.filter((w) => w.status === status);
  }

  res.json(results);
});

// GET /api/workers/:id - Get worker profile with attendance history
router.get("/:id", (req, res) => {
  const db = getDatabase();
  const worker = db.workers.find((w) => w.id === req.params.id);
  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  // Find attendance history for this worker
  const history = db.attendance
    .filter((a) => a.workerId === worker.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Find leave requests
  const leaves = db.leaveRequests.filter((l) => l.workerId === worker.id);

  res.json({
    ...worker,
    attendanceHistory: history,
    leaveRequests: leaves,
  });
});

// POST /api/workers - Add worker
router.post("/", (req, res) => {
  const user = getAuthUser(req);
  if (
    !user ||
    (user.role !== "Admin" &&
      user.role !== "HR" &&
      user.role !== "Supervisor")
  ) {
    return res
      .status(403)
      .json({ error: "Unauthorized. Admin, HR, or Supervisor role required." });
  }

  const {
    name,
    email,
    phone,
    department,
    designation,
    address,
    dateOfJoining,
    shiftTiming,
    salary,
    status,
    performanceRating,
    emergencyContact,
    photo,
    documents,
  } = req.body;

  if (!name || !department || !designation || !phone) {
    return res
      .status(400)
      .json({
        error: "Name, department, designation, and phone are required.",
      });
  }

  const db = getDatabase();

  // Generate unique ID
  const lastIdNum = db.workers
    .map((w) => parseInt(w.id.split("-")[1]))
    .reduce((max, val) => (val > max ? val : max), 100);
  const newId = `W-${lastIdNum + 1}`;

  const newWorker = {
    id: newId,
    name,
    email: email || "",
    phone,
    department,
    designation,
    address: address || "",
    dateOfJoining: dateOfJoining || new Date().toISOString().split("T")[0],
    shiftTiming: shiftTiming || "08:00 AM - 04:00 PM",
    salary: salary ? Number(salary) : 0,
    status: status || "Active",
    performanceRating: performanceRating ? Number(performanceRating) : 5.0,
    emergencyContact: emergencyContact || { name: "", relation: "", phone: "" },
    photo: photo || "",
    documents: documents || [],
  };

  db.workers.push(newWorker);
  saveDatabase(db);

  logActivity(
    user.email,
    "Worker Created",
    `Added new worker ${name} (${newId}) in department ${department}.`,
  );

  res.status(201).json(newWorker);
});

// PUT /api/workers/:id - Edit worker
router.put("/:id", (req, res) => {
  const user = getAuthUser(req);
  if (
    !user ||
    (user.role !== "Admin" && user.role !== "HR" && user.role !== "Supervisor")
  ) {
    return res.status(403).json({ error: "Unauthorized." });
  }

  const { id } = req.params;
  const db = getDatabase();
  const workerIndex = db.workers.findIndex((w) => w.id === id);

  if (workerIndex === -1) {
    return res.status(404).json({ error: "Worker not found" });
  }

  const existing = db.workers[workerIndex];

  // Supervisor can edit all fields including salary
  const updatedData = { ...req.body };

  const updatedWorker = {
    ...existing,
    ...updatedData,
    id: existing.id, // Keep original ID
  };

  db.workers[workerIndex] = updatedWorker;
  saveDatabase(db);

  logActivity(
    user.email,
    "Worker Updated",
    `Updated worker profile for ${updatedWorker.name} (${id}).`,
  );

  res.json(updatedWorker);
});

// DELETE /api/workers/:id - Delete worker
router.delete("/:id", (req, res) => {
  const user = getAuthUser(req);
  if (
    !user ||
    (user.role !== "Admin" &&
      user.role !== "HR" &&
      user.role !== "Supervisor")
  ) {
    return res
      .status(403)
      .json({ error: "Unauthorized. Admin, HR, or Supervisor role required." });
  }

  const { id } = req.params;
  const db = getDatabase();
  const worker = db.workers.find((w) => w.id === id);

  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  db.workers = db.workers.filter((w) => w.id !== id);
  // Also clean up their attendance and leaves to maintain clean DB
  db.attendance = db.attendance.filter((a) => a.workerId !== id);
  db.leaveRequests = db.leaveRequests.filter((l) => l.workerId !== id);

  saveDatabase(db);

  logActivity(
    user.email,
    "Worker Deleted",
    `Deleted worker ${worker.name} (${id}) and related logs.`,
  );

  res.json({ message: `Worker ${id} deleted successfully.` });
});

export default router;
