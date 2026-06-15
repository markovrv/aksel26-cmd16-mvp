import { Router } from "express";
import { getDb } from "../db/connection.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/companies
router.get("/", optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const companies = db.prepare("SELECT * FROM companies WHERE is_active = 1 ORDER BY sort_order").all();

    if (req.user) {
      const stations = db.prepare("SELECT company_id, pieces, choice FROM user_station_progress WHERE user_id = ?").all(req.user.id);
      const stationMap = {};
      for (const s of stations) {
        stationMap[s.company_id] = { pieces: JSON.parse(s.pieces), choice: s.choice };
      }
      const result = companies.map(c => ({
        ...c,
        completedPieces: stationMap[c.id]?.pieces || [],
        choice: stationMap[c.id]?.choice || null,
      }));
      return res.json(result);
    }

    res.json(companies);
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id
router.get("/:id", optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const company = db.prepare("SELECT * FROM companies WHERE id = ? AND is_active = 1").get(req.params.id);
    if (!company) return res.status(404).json({ error: "Предприятие не найдено" });

    if (req.user) {
      const station = db.prepare("SELECT pieces, choice FROM user_station_progress WHERE user_id = ? AND company_id = ?").get(req.user.id, req.params.id);
      company.completedPieces = station ? JSON.parse(station.pieces) : [];
      company.choice = station?.choice || null;
    }

    res.json(company);
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id/tasks
router.get("/:id/tasks", optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const company = db.prepare("SELECT * FROM companies WHERE id = ? AND is_active = 1").get(req.params.id);
    if (!company) return res.status(404).json({ error: "Предприятие не найдено" });

    const tasks = db.prepare(`
      SELECT t.* FROM tasks t
      WHERE t.company_id = ? AND t.is_active = 1
      ORDER BY t.task_number
    `).all(req.params.id);

    // Attach options
    for (const task of tasks) {
      task.options = db.prepare("SELECT * FROM task_options WHERE task_id = ? ORDER BY sort_order").all(task.id);
    }

    res.json({ company, tasks });
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id/pieces
router.get("/:id/pieces", optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const { track } = req.query;

    let pieces;
    if (track === "business" || track === "career") {
      pieces = db.prepare(`
        SELECT * FROM station_pieces
        WHERE company_id = ? AND is_active = 1 AND (track IS NULL OR track = ?)
        ORDER BY piece_index
      `).all(req.params.id, track);
    } else {
      pieces = db.prepare(`
        SELECT * FROM station_pieces
        WHERE company_id = ? AND is_active = 1 AND track IS NULL
        ORDER BY piece_index
      `).all(req.params.id);
    }

    res.json(pieces);
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id/pieces/:index
router.get("/:id/pieces/:index", optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const { track } = req.query;

    const piece = db.prepare(`
      SELECT * FROM station_pieces
      WHERE company_id = ? AND piece_index = ? AND is_active = 1
        AND (track IS NULL OR track = ?)
      ORDER BY track NULLS FIRST
      LIMIT 1
    `).get(req.params.id, parseInt(req.params.index), track || null);

    if (!piece) return res.status(404).json({ error: "Блок не найден" });
    res.json(piece);
  } catch (err) {
    next(err);
  }
});

export default router;