import { Router } from "express";
import { getDb } from "../db/connection.js";
import auth from "../middleware/auth.js";

const router = Router();

// GET /api/final-result?track=business|career
router.get("/", auth, (req, res, next) => {
  try {
    const db = getDb();
    const { track } = req.query;

    if (!track || !["business", "career"].includes(track)) {
      return res.status(400).json({ error: "Параметр track обязателен: business или career" });
    }

    const result = db.prepare("SELECT * FROM final_results WHERE track = ? AND is_active = 1").get(track);
    if (!result) {
      return res.status(404).json({ error: "Финальный результат не найден для данного трека" });
    }

    // Parse JSON fields
    result.tags = JSON.parse(result.tags);
    result.steps = JSON.parse(result.steps);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/final-result/:track — совместимость с клиентским api (api.finalResult.get(track))
router.get("/:track", auth, (req, res, next) => {
  try {
    const db = getDb();
    const { track } = req.params;

    if (!["business", "career"].includes(track)) {
      return res.status(400).json({ error: "Трек должен быть business или career" });
    }

    const result = db.prepare("SELECT * FROM final_results WHERE track = ? AND is_active = 1").get(track);
    if (!result) {
      return res.status(404).json({ error: "Финальный результат не найден" });
    }

    result.tags = JSON.parse(result.tags);
    result.steps = JSON.parse(result.steps);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;