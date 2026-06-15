import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../../db/connection.js";
import validate from "../../middleware/validate.js";

const router = Router();

// GET /api/admin/tasks
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY company_id, profession, task_number").all();
    for (const t of tasks) {
      t.options = db.prepare("SELECT * FROM task_options WHERE task_id = ? ORDER BY sort_order").all(t.id);
    }
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/tasks
router.post("/", [
  body("company_id").notEmpty(),
  body("profession").notEmpty(),
  body("task_number").isInt({ min: 1, max: 3 }),
  body("title").notEmpty(),
  body("description").notEmpty(),
  body("task_type").notEmpty(),
  body("max_score").isInt(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { company_id, profession, task_number, title, description, task_type, max_score, config_json, is_active } = req.body;
    const result = db.prepare(`
      INSERT INTO tasks (company_id, profession, task_number, title, description, task_type, max_score, config_json, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(company_id, profession, task_number, title, description, task_type, max_score, JSON.stringify(config_json || {}), is_active !== undefined ? is_active : 1);

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/tasks/:id
router.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const id = parseInt(req.params.id);
    const { company_id, profession, task_number, title, description, task_type, max_score, config_json, is_active } = req.body;

    const fields = [];
    const values = [];
    if (company_id !== undefined) { fields.push("company_id = ?"); values.push(company_id); }
    if (profession !== undefined) { fields.push("profession = ?"); values.push(profession); }
    if (task_number !== undefined) { fields.push("task_number = ?"); values.push(task_number); }
    if (title !== undefined) { fields.push("title = ?"); values.push(title); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (task_type !== undefined) { fields.push("task_type = ?"); values.push(task_type); }
    if (max_score !== undefined) { fields.push("max_score = ?"); values.push(max_score); }
    if (config_json !== undefined) { fields.push("config_json = ?"); values.push(JSON.stringify(config_json)); }
    if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      db.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/tasks/:id
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(parseInt(req.params.id));
    if (result.changes === 0) return res.status(404).json({ error: "Задача не найдена" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;