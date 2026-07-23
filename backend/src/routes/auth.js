import { Router } from "express";
import { getDatabase, saveDatabase, logActivity } from "../db/db.js";

const router = Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = getDatabase();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  logActivity(
    email,
    "User Login",
    `${user.name} logged in successfully as ${user.role}.`,
  );

  // Return a mock token containing the role for parsing on frontend
  const token = Buffer.from(
    JSON.stringify({ email: user.email, role: user.role, name: user.name }),
  ).toString("base64");

  return res.json({
    token,
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// POST /api/auth/signup
router.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Name, email, password, and role are required" });
  }

  const db = getDatabase();
  const existing = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) {
    return res
      .status(400)
      .json({ error: "User with this email already exists" });
  }

  const newUser = {
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    role: role,
  };

  db.users.push(newUser);
  saveDatabase(db);
  logActivity(email, "User Signup", `New user registered: ${name} as ${role}.`);

  const token = Buffer.from(
    JSON.stringify({
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    }),
  ).toString("base64");

  return res.json({
    token,
    user: {
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
  });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  logActivity(
    "system@system.com",
    "Forgot Password Request",
    `Reset password request sent for: ${email}`,
  );
  return res.json({ message: "Verification link sent to " + email });
});

// POST /api/auth/verify-email
router.post("/verify-email", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }
  logActivity(
    "system@system.com",
    "Email Verification Success",
    `Email verified for user: ${email}`,
  );
  return res.json({ message: "Email verified successfully." });
});

export default router;
