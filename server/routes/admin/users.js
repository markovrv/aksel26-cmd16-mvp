import { Router } from "express";
import { getDb } from "../../db/connection.js";

const router = Router();

// GET /api/admin/users
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let query = "SELECT id, name, email, category, role, school, region, created_at, updated_at FROM users";
    let countQuery = "SELECT COUNT(*) as c FROM users";
    const params = [];

    if (search) {
      query += " WHERE (name LIKE ? OR email LIKE ?)";
      countQuery += " WHERE (name LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const users = db.prepare(query).all(...params);
    const total = db.prepare(countQuery).get(...(search ? [`%${search}%`, `%${search}%`] : []));

    res.json({ users, total: total.c, page, limit });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users/:id
router.get("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const user = db.prepare("SELECT id, name, email, category, role, school, region, created_at, updated_at FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const progress = db.prepare("SELECT * FROM user_progress WHERE user_id = ?").get(req.params.id);
    const stations = db.prepare("SELECT * FROM user_station_progress WHERE user_id = ?").all(req.params.id);
    const taskResults = db.prepare("SELECT * FROM user_task_results WHERE user_id = ?").all(req.params.id);
    const achievements = db.prepare(`
      SELECT a.*, ua.unlocked_at FROM achievements a
      JOIN user_achievements ua ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
    `).all(req.params.id);

    res.json({ user, progress, stations, taskResults, achievements });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id
router.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { name, email, category, role, school, region } = req.body;

    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (email !== undefined) { fields.push("email = ?"); values.push(email); }
    if (category !== undefined) { fields.push("category = ?"); values.push(category); }
    if (role !== undefined) { fields.push("role = ?"); values.push(role); }
    if (school !== undefined) { fields.push("school = ?"); values.push(school); }
    if (region !== undefined) { fields.push("region = ?"); values.push(region); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(req.params.id);
      db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }

    const user = db.prepare("SELECT id, name, email, category, role, school, region, created_at, updated_at FROM users WHERE id = ?").get(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Пользователь не найден" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users/:id/export
router.get("/:id/export", (req, res, next) => {
  try {
    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const progress = db.prepare("SELECT * FROM user_progress WHERE user_id = ?").get(req.params.id);
    const stations = db.prepare("SELECT * FROM user_station_progress WHERE user_id = ?").all(req.params.id);
    const tasks = db.prepare("SELECT * FROM user_task_results WHERE user_id = ?").all(req.params.id);
    const achievements = db.prepare(`
      SELECT a.*, ua.unlocked_at FROM achievements a
      JOIN user_achievements ua ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
    `).all(req.params.id);

    res.json({ user, progress, stations, tasks, achievements });
  } catch (err) {
    next(err);
  }
});

export default router;