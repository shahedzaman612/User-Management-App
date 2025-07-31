import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db.js";

const app = express();
const PORT = 5000;
const JWT_SECRET = "secretkey123";

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

/**
 * Middleware: Check token, user exists, and not blocked
 */
const verifyUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json("Unauthorized");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [decoded.id]);
    if (!rows.length) return res.clearCookie("token").status(401).json("User not found");
    const user = rows[0];
    if (user.status === "blocked") {
      return res.clearCookie("token").status(403).json("User is blocked");
    }
    req.user = user;
    next();
  } catch {
    return res.clearCookie("token").status(401).json("Invalid token");
  }
};

/**
 * POST /api/register
 * Register a new user
 */
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hash]
    );
    res.json("Registered");
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json("Email already exists");
    } else {
      res.status(500).json("Server error");
    }
  }
});

/**
 * POST /api/login
 * Login user, issue token
 */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

  if (!rows.length) return res.status(401).json("Invalid credentials");
  const user = rows[0];

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json("Wrong password");

  if (user.status === "blocked") return res.status(403).json("User is blocked");

  await db.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.cookie("token", token, { httpOnly: true }).json("Logged in");
});

/**
 * POST /api/logout
 * Logout user by clearing token
 */
app.post("/api/logout", (req, res) => {
  res.clearCookie("token").json("Logged out");
});

/**
 * GET /api/users
 * Return list of all users
 */
app.get("/api/users", verifyUser, async (req, res) => {
  const [users] = await db.execute(
    "SELECT id, name, email, status, last_login, created_at FROM users ORDER BY last_login DESC"
  );
  res.json(users);
});

/**
 * POST /api/users/block
 * Block selected users
 */
app.post("/api/users/block", verifyUser, async (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json("No IDs");
  await db.query(
    `UPDATE users SET status = 'blocked' WHERE id IN (${ids.map(() => "?").join(",")})`,
    ids
  );
  res.json("Users blocked");
});

/**
 * POST /api/users/unblock
 * Unblock selected users
 */
app.post("/api/users/unblock", verifyUser, async (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json("No IDs");
  await db.query(
    `UPDATE users SET status = 'active' WHERE id IN (${ids.map(() => "?").join(",")})`,
    ids
  );
  res.json("Users unblocked");
});

/**
 * POST /api/users/delete
 * Delete selected users
 */
app.post("/api/users/delete", verifyUser, async (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json("No IDs");
  await db.query(
    `DELETE FROM users WHERE id IN (${ids.map(() => "?").join(",")})`,
    ids
  );
  res.json("Users deleted");
});

/**
 * GET /api/check
 * Simple token & block check
 */
app.get("/api/check", verifyUser, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    status: req.user.status,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
