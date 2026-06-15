import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../db/connection.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyToken, getRefreshExpiresAt } from "../utils/jwt.js";
import validate from "../middleware/validate.js";
import auth from "../middleware/auth.js";

const router = Router();

// POST /auth/register
router.post("/register", [
  body("name").trim().notEmpty().withMessage("Имя обязательно"),
  body("email").isEmail().normalizeEmail().withMessage("Некорректный email"),
  body("password").isLength({ min: 6 }).withMessage("Пароль минимум 6 символов"),
  body("category").optional().trim(),
  body("role").optional().trim(),
  body("school").optional().trim(),
  body("classCode").optional().trim(),
  validate,
], async (req, res, next) => {
  try {
    const { name, email, password, category, role, school, classCode } = req.body;
    const db = getDb();

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "Email уже зарегистрирован" });
    }

    const password_hash = await hashPassword(password);
    db.prepare(
      "INSERT INTO users (name, email, password_hash, category, school, class_code) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(name, email, password_hash, category || "Школьник", school || null, classCode || null);

    const userId = db.prepare("SELECT id FROM users WHERE email = ?").get(email).id;

    // Create user_progress record
    db.prepare("INSERT INTO user_progress (user_id) VALUES (?)").run(userId);

    const user = db.prepare("SELECT id, name, email, category, role, school, class_code, created_at FROM users WHERE id = ?").get(userId);

    const accessToken = signAccessToken({ userId, role: user.role });
    const refreshToken = signRefreshToken({ userId, role: user.role });

    db.prepare("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)").run(userId, refreshToken, getRefreshExpiresAt());

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post("/login", [
  body("email").isEmail().normalizeEmail().withMessage("Некорректный email"),
  body("password").notEmpty().withMessage("Пароль обязателен"),
  validate,
], async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    db.prepare("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)").run(user.id, refreshToken, getRefreshExpiresAt());

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

// POST /auth/refresh
router.post("/refresh", [
  body("refreshToken").notEmpty().withMessage("Refresh token обязателен"),
  validate,
], (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const db = getDb();

    const stored = db.prepare("SELECT * FROM refresh_tokens WHERE token = ?").get(refreshToken);
    if (!stored) {
      return res.status(401).json({ error: "Refresh token не найден" });
    }

    db.prepare("DELETE FROM refresh_tokens WHERE id = ?").run(stored.id);

    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch {
      return res.status(401).json({ error: "Refresh token истёк или недействителен" });
    }

    const user = db.prepare("SELECT id, role FROM users WHERE id = ?").get(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    const newAccessToken = signAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role });

    db.prepare("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)").run(user.id, newRefreshToken, getRefreshExpiresAt());

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post("/logout", auth, (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const db = getDb();
      db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(refreshToken);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;