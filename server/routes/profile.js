import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../db/connection.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

// GET /api/profile
router.get("/", auth, (req, res, next) => {
  try {
    const db = getDb();
    const user = db.prepare("SELECT id, name, email, category, role, school, region, created_at, updated_at FROM users WHERE id = ?").get(req.user.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const progress = db.prepare("SELECT * FROM user_progress WHERE user_id = ?").get(req.user.id);
    const avatar = db.prepare("SELECT * FROM user_avatar WHERE user_id = ?").get(req.user.id);
    const achievements = db.prepare(`
      SELECT a.*, ua.unlocked_at FROM achievements a
      JOIN user_achievements ua ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
    `).all(req.user.id);

    res.json({ user, progress, avatar, achievements });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile
router.put("/", auth, [
  body("name").optional().trim().notEmpty(),
  body("email").optional().isEmail().normalizeEmail(),
  body("category").optional().trim(),
  body("school").optional().trim(),
  body("region").optional().trim(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { name, email, category, school, region } = req.body;

    if (email) {
      const existing = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, req.user.id);
      if (existing) return res.status(409).json({ error: "Email уже используется" });
    }

    const fields = [];
    const values = [];
    if (name) { fields.push("name = ?"); values.push(name); }
    if (email) { fields.push("email = ?"); values.push(email); }
    if (category) { fields.push("category = ?"); values.push(category); }
    if (school !== undefined) { fields.push("school = ?"); values.push(school); }
    if (region !== undefined) { fields.push("region = ?"); values.push(region); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(req.user.id);
      db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }

    const user = db.prepare("SELECT id, name, email, category, role, school, region, created_at, updated_at FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile/avatar
router.put("/avatar", auth, [
  body("skin").optional().isString(),
  body("hair").optional().isString(),
  body("suit").optional().isString(),
  body("hair_style").optional().isString(),
  body("suit_style").optional().isString(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { skin, hair, suit, hair_style, suit_style } = req.body;

    const existing = db.prepare("SELECT user_id FROM user_avatar WHERE user_id = ?").get(req.user.id);
    if (existing) {
      const fields = [];
      const values = [];
      if (skin) { fields.push("skin = ?"); values.push(skin); }
      if (hair) { fields.push("hair = ?"); values.push(hair); }
      if (suit) { fields.push("suit = ?"); values.push(suit); }
      if (hair_style) { fields.push("hair_style = ?"); values.push(hair_style); }
      if (suit_style) { fields.push("suit_style = ?"); values.push(suit_style); }
      fields.push("updated_at = datetime('now')");
      values.push(req.user.id);
      db.prepare(`UPDATE user_avatar SET ${fields.join(", ")} WHERE user_id = ?`).run(...values);
    } else {
      db.prepare("INSERT INTO user_avatar (user_id, skin, hair, suit, hair_style, suit_style) VALUES (?, ?, ?, ?, ?, ?)").run(
        req.user.id,
        skin || "#f0b38f",
        hair || "#37251c",
        suit || "#536dfe",
        hair_style || "default",
        suit_style || "default"
      );
      const progress = db.prepare("SELECT avatar_created FROM user_progress WHERE user_id = ?").get(req.user.id);
      if (progress && !progress.avatar_created) {
        db.prepare("UPDATE user_progress SET avatar_created = 1, score = score + 25, updated_at = datetime('now') WHERE user_id = ?").run(req.user.id);
      }
    }

    const avatar = db.prepare("SELECT * FROM user_avatar WHERE user_id = ?").get(req.user.id);
    res.json(avatar);
  } catch (err) {
    next(err);
  }
});

// GET /api/profile/achievements
router.get("/achievements", auth, (req, res, next) => {
  try {
    const db = getDb();
    const achievements = db.prepare(`
      SELECT a.*, ua.unlocked_at FROM achievements a
      LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
      ORDER BY a.is_game, a.id
    `).all(req.user.id);
    res.json(achievements);
  } catch (err) {
    next(err);
  }
});

// GET /api/profile/progress
router.get("/progress", auth, (req, res, next) => {
  try {
    const db = getDb();
    const progress = db.prepare("SELECT * FROM user_progress WHERE user_id = ?").get(req.user.id);
    const stations = db.prepare("SELECT * FROM user_station_progress WHERE user_id = ?").all(req.user.id);
    const taskResults = db.prepare("SELECT * FROM user_task_results WHERE user_id = ?").all(req.user.id);
    const answers = db.prepare("SELECT * FROM user_answers WHERE user_id = ?").all(req.user.id);
    const pieceAnswers = db.prepare("SELECT * FROM user_station_piece_answers WHERE user_id = ?").all(req.user.id);
    const gameHistory = db.prepare("SELECT * FROM user_game_history WHERE user_id = ? ORDER BY created_at").all(req.user.id);

    res.json({ progress, stations, taskResults, answers, pieceAnswers, gameHistory });
  } catch (err) {
    next(err);
  }
});

// POST /api/profile/reset — сброс всего прогресса пользователя
router.post("/reset", auth, (req, res, next) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    // Delete all progress data
    db.prepare("DELETE FROM user_progress WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM user_answers WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM user_station_progress WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM user_task_results WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM user_station_piece_answers WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM user_achievements WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM user_avatar WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM user_tours WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM user_game_history WHERE user_id = ?").run(userId);

    res.json({ ok: true, message: "Прогресс полностью сброшен" });
  } catch (err) {
    next(err);
  }
});

// GET /api/profile/tours
router.get("/tours", auth, (req, res, next) => {
  try {
    const db = getDb();
    const tours = db.prepare("SELECT * FROM user_tours WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json(tours);
  } catch (err) {
    next(err);
  }
});

// POST /api/profile/tours
router.post("/tours", auth, [
  body("companyId").notEmpty(),
  body("date").notEmpty(),
  body("phone").notEmpty().trim(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { companyId, date, phone } = req.body;

    db.prepare(
      "INSERT INTO user_tours (user_id, company_id, tour_date, phone) VALUES (?, ?, ?, ?)"
    ).run(req.user.id, companyId, date, phone);

    db.prepare("UPDATE user_progress SET score = score + 15, updated_at = datetime('now') WHERE user_id = ?").run(req.user.id);

    const tour = db.prepare("SELECT * FROM user_tours WHERE user_id = ? AND company_id = ? ORDER BY created_at DESC LIMIT 1").get(req.user.id, companyId);
    res.status(201).json(tour);
  } catch (err) {
    next(err);
  }
});

export default router;