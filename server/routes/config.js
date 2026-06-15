import { Router } from "express";
import { getDb } from "../db/connection.js";

const router = Router();

// GET /api/config — combined config
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const scoring = db.prepare("SELECT * FROM scoring_config ORDER BY task_number").all();
    const levels = db.prepare("SELECT * FROM level_thresholds ORDER BY sort_order").all();
    const workers = db.prepare("SELECT * FROM game_workers WHERE is_active = 1 ORDER BY id").all();
    const docRows = db.prepare("SELECT * FROM game_doc_rows WHERE is_active = 1 ORDER BY row_index").all();
    const scoringResult = {};
    for (const c of scoring) {
      scoringResult[c.task_number] = { ms: c.bonus_threshold_ms, bonus: c.bonus_points, base: c.base_score };
    }
    res.json({ scoring: scoringResult, levels, game: { workers, docRows } });
  } catch (err) {
    next(err);
  }
});

// GET /api/config/scoring
router.get("/scoring", (req, res, next) => {
  try {
    const db = getDb();
    const config = db.prepare("SELECT * FROM scoring_config ORDER BY task_number").all();
    const result = {};
    for (const c of config) {
      result[c.task_number] = { ms: c.bonus_threshold_ms, bonus: c.bonus_points, base: c.base_score };
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/config/levels
router.get("/levels", (req, res, next) => {
  try {
    const db = getDb();
    const levels = db.prepare("SELECT * FROM level_thresholds ORDER BY sort_order").all();
    res.json(levels);
  } catch (err) {
    next(err);
  }
});

// GET /api/config/game
router.get("/game", (req, res, next) => {
  try {
    const db = getDb();
    const workers = db.prepare("SELECT * FROM game_workers WHERE is_active = 1 ORDER BY id").all();
    const docRows = db.prepare("SELECT * FROM game_doc_rows WHERE is_active = 1 ORDER BY row_index").all();
    res.json({ workers, docRows });
  } catch (err) {
    next(err);
  }
});

export default router;