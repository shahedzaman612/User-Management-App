// server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

// Middleware

app.use(
  cors({
    origin: [
      "https://user-management-frontend-tmrj.onrender.com",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Middleware to verify user
const verifyUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json("Unauthorized");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await db.query("SELECT * FROM users WHERE id = $1", [
      decoded.id,
    ]);
    if (!result.rows.length)
      return res.clearCookie("token").status(401).json("User not found");

    const user = result.rows[0];
    if (user.status === "blocked") {
      return res.clearCookie("token").status(403).json("User is blocked");
    }
    req.user = user;
    next();
  } catch {
    return res.clearCookie("token").status(401).json("Invalid token");
  }
};

// Routes
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
      [name, email, hash]
    );
    res.json("Registered");
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json("Email already exists");
    } else {
      res.status(500).json("Server error");
    }
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (!result.rows.length) return res.status(401).json("Invalid credentials");

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json("Wrong password");

  if (user.status === "blocked") return res.status(403).json("User is blocked");

  await db.query(
    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
    [user.id]
  );

  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.cookie("token", token, { httpOnly: true }).json("Logged in");
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token").json("Logged out");
});

app.get("/api/users", verifyUser, async (req, res) => {
  const result = await db.query(
    "SELECT id, name, email, status, last_login, created_at FROM users ORDER BY last_login DESC"
  );
  res.json(result.rows);
});

app.post("/api/users/block", verifyUser, async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) return res.status(400).json("No IDs");

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  await db.query(
    `UPDATE users SET status = 'blocked' WHERE id IN (${placeholders})`,
    ids
  );
  res.json("Users blocked");
});

app.post("/api/users/unblock", verifyUser, async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) return res.status(400).json("No IDs");

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  await db.query(
    `UPDATE users SET status = 'active' WHERE id IN (${placeholders})`,
    ids
  );
  res.json("Users unblocked");
});

app.post("/api/users/delete", verifyUser, async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) return res.status(400).json("No IDs");

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  await db.query(`DELETE FROM users WHERE id IN (${placeholders})`, ids);
  res.json("Users deleted");
});

app.get("/api/check", verifyUser, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    status: req.user.status,
  });
});
app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
