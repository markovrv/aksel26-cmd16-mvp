import { Router } from "express";
import { getDb } from "../../db/connection.js";

const router = Router();

// GET /api/admin/scoring-config
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const config = db.prepare("SELECT * FROM scoring_config ORDER BY task_number").all();
    res.json(config);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/scoring-config/:id
router.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { base_score, bonus_threshold_ms, bonus_points } = req.body;
    const fields = [];
    const values = [];
    if (base_score !== undefined) { fields.push("base_score = ?"); values.push(base_score); }
    if (bonus_threshold_ms !== undefined) { fields.push("bonus_threshold_ms = ?"); values.push(bonus_threshold_ms); }
    if (bonus_points !== undefined) { fields.push("bonus_points = ?"); values.push(bonus_points); }
    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(parseInt(req.params.id));
      db.prepare(`UPDATE scoring_config SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
    const config = db.prepare("SELECT * FROM scoring_config WHERE id = ?").get(parseInt(req.params.id));
    res.json(config);
  } catch (err) {
    next(err);
  }
});

export default router;