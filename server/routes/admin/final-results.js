import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../../db/connection.js";
import validate from "../../middleware/validate.js";

const router = Router();

// GET /api/admin/final-results
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const results = db.prepare("SELECT * FROM final_results ORDER BY track").all();
    for (const r of results) {
      r.tags = JSON.parse(r.tags);
      r.steps = JSON.parse(r.steps);
    }
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/final-results/:id
router.get("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare("SELECT * FROM final_results WHERE id = ?").get(parseInt(req.params.id));
    if (!result) return res.status(404).json({ error: "Результат не найден" });
    result.tags = JSON.parse(result.tags);
    result.steps = JSON.parse(result.steps);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/final-results
router.post("/", [
  body("track").isIn(["business", "career"]),
  body("title").notEmpty(),
  body("project_name").notEmpty(),
  body("description").notEmpty(),
  body("tags").isArray(),
  body("steps").isArray(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { track, title, project_name, description, tags, steps, is_active } = req.body;
    const result = db.prepare(`
      INSERT INTO final_results (track, title, project_name, description, tags, steps, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(track, title, project_name, description, JSON.stringify(tags), JSON.stringify(steps), is_active !== undefined ? is_active : 1);

    const finalResult = db.prepare("SELECT * FROM final_results WHERE id = ?").get(result.lastInsertRowid);
    finalResult.tags = JSON.parse(finalResult.tags);
    finalResult.steps = JSON.parse(finalResult.steps);
    res.status(201).json(finalResult);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/final-results/:id
router.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const id = parseInt(req.params.id);
    const { track, title, project_name, description, tags, steps, is_active } = req.body;

    const fields = [];
    const values = [];
    if (track !== undefined) { fields.push("track = ?"); values.push(track); }
    if (title !== undefined) { fields.push("title = ?"); values.push(title); }
    if (project_name !== undefined) { fields.push("project_name = ?"); values.push(project_name); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (tags !== undefined) { fields.push("tags = ?"); values.push(JSON.stringify(tags)); }
    if (steps !== undefined) { fields.push("steps = ?"); values.push(JSON.stringify(steps)); }
    if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      db.prepare(`UPDATE final_results SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }

    const result = db.prepare("SELECT * FROM final_results WHERE id = ?").get(id);
    result.tags = JSON.parse(result.tags);
    result.steps = JSON.parse(result.steps);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/final-results/:id
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM final_results WHERE id = ?").run(parseInt(req.params.id));
    if (result.changes === 0) return res.status(404).json({ error: "Результат не найден" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;