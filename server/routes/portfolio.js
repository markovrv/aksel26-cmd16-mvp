import { Router } from "express";
import { getDb } from "../db/connection.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/portfolio
router.get("/", auth, (req, res, next) => {
  try {
    const db = getDb();
    const user = db.prepare("SELECT id, name, email, category, school, region, created_at FROM users WHERE id = ?").get(req.user.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const progress = db.prepare("SELECT * FROM user_progress WHERE user_id = ?").get(req.user.id);
    const avatar = db.prepare("SELECT * FROM user_avatar WHERE user_id = ?").get(req.user.id);
    const achievements = db.prepare(`
      SELECT a.*, ua.unlocked_at FROM achievements a
      JOIN user_achievements ua ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
    `).all(req.user.id);
    const completedStations = db.prepare("SELECT * FROM user_station_progress WHERE user_id = ?").all(req.user.id);
    const taskResults = db.prepare("SELECT * FROM user_task_results WHERE user_id = ? ORDER BY created_at").all(req.user.id);

    res.json({ user, progress, avatar, achievements, completedStations, taskResults });
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/:userId
router.get("/:userId", auth, (req, res, next) => {
  try {
    const db = getDb();
    const user = db.prepare("SELECT id, name, email, category, school, region, created_at FROM users WHERE id = ?").get(req.params.userId);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const progress = db.prepare("SELECT * FROM user_progress WHERE user_id = ?").get(req.params.userId);
    const avatar = db.prepare("SELECT * FROM user_avatar WHERE user_id = ?").get(req.params.userId);
    const achievements = db.prepare(`
      SELECT a.*, ua.unlocked_at FROM achievements a
      JOIN user_achievements ua ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
    `).all(req.params.userId);
    const completedStations = db.prepare("SELECT * FROM user_station_progress WHERE user_id = ?").all(req.params.userId);
    const taskResults = db.prepare("SELECT * FROM user_task_results WHERE user_id = ? ORDER BY created_at").all(req.params.userId);

    res.json({ user, progress, avatar, achievements, completedStations, taskResults });
  } catch (err) {
    next(err);
  }
});

export default router;