import { Router } from "express";
import { getDb } from "../../db/connection.js";

const router = Router();

// GET /api/admin/level-thresholds
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const levels = db.prepare("SELECT * FROM level_thresholds ORDER BY sort_order").all();
    res.json(levels);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/level-thresholds/:id
router.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { level_name, min_score, sort_order } = req.body;
    const fields = [];
    const values = [];
    if (level_name !== undefined) { fields.push("level_name = ?"); values.push(level_name); }
    if (min_score !== undefined) { fields.push("min_score = ?"); values.push(min_score); }
    if (sort_order !== undefined) { fields.push("sort_order = ?"); values.push(sort_order); }
    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(parseInt(req.params.id));
      db.prepare(`UPDATE level_thresholds SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
    const level = db.prepare("SELECT * FROM level_thresholds WHERE id = ?").get(parseInt(req.params.id));
    res.json(level);
  } catch (err) {
    next(err);
  }
});

export default router;