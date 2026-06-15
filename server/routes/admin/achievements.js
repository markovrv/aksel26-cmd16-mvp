import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../../db/connection.js";
import validate from "../../middleware/validate.js";

const router = Router();

// GET /api/admin/achievements
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const achievements = db.prepare("SELECT * FROM achievements ORDER BY is_game, id").all();
    res.json(achievements);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/achievements
router.post("/", [
  body("id").notEmpty(),
  body("name").notEmpty(),
  body("icon").notEmpty(),
  body("description").notEmpty(),
  body("condition_key").notEmpty(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { id, name, icon, description, condition_key, is_game, is_active } = req.body;
    db.prepare("INSERT INTO achievements (id, name, icon, description, condition_key, is_game, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id, name, icon, description, condition_key, is_game || 0, is_active !== undefined ? is_active : 1
    );
    const achievement = db.prepare("SELECT * FROM achievements WHERE id = ?").get(id);
    res.status(201).json(achievement);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/achievements/:id
router.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { name, icon, description, condition_key, is_game, is_active } = req.body;
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (icon !== undefined) { fields.push("icon = ?"); values.push(icon); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (condition_key !== undefined) { fields.push("condition_key = ?"); values.push(condition_key); }
    if (is_game !== undefined) { fields.push("is_game = ?"); values.push(is_game); }
    if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active); }
    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(req.params.id);
      db.prepare(`UPDATE achievements SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
    const achievement = db.prepare("SELECT * FROM achievements WHERE id = ?").get(req.params.id);
    res.json(achievement);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/achievements/:id
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM achievements WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Достижение не найдено" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;