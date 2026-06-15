import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../db/connection.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

// POST /api/station-pieces/:id/complete
router.post("/:id/complete", auth, [
  body("selectedOption").isInt({ min: 0, max: 1 }).withMessage("Выберите вариант"),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const pieceId = parseInt(req.params.id);
    const { selectedOption } = req.body;

    const piece = db.prepare("SELECT * FROM station_pieces WHERE id = ? AND is_active = 1").get(pieceId);
    if (!piece) return res.status(404).json({ error: "Блок не найден" });

    // Check if already completed
    const existing = db.prepare(
      "SELECT id FROM user_station_piece_answers WHERE user_id = ? AND company_id = ? AND piece_index = ?"
    ).get(req.user.id, piece.company_id, piece.piece_index);

    if (existing) {
      return res.status(409).json({ error: "Блок уже пройден" });
    }

    // Check if correct
    let isCorrect = null;
    if (piece.correct_option_index !== null) {
      isCorrect = selectedOption === piece.correct_option_index ? 1 : 0;
    }

    // Save answer
    db.prepare(`
      INSERT INTO user_station_piece_answers (user_id, company_id, piece_index, selected_option, is_correct, score_awarded)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, piece.company_id, piece.piece_index, selectedOption, isCorrect, piece.score);

    // Update station progress
    const station = db.prepare(
      "SELECT pieces, choice FROM user_station_progress WHERE user_id = ? AND company_id = ?"
    ).get(req.user.id, piece.company_id);

    if (station) {
      const pieces = JSON.parse(station.pieces);
      if (!pieces.includes(piece.piece_index)) {
        pieces.push(piece.piece_index);
        pieces.sort();

        let choice = station.choice;
        if (piece.piece_index === 3) {
          choice = selectedOption === 0 ? "business" : "career";
        }

        db.prepare(`
          UPDATE user_station_progress SET pieces = ?, choice = ?, updated_at = datetime('now')
          WHERE user_id = ? AND company_id = ?
        `).run(JSON.stringify(pieces), choice, req.user.id, piece.company_id);
      }
    } else {
      const pieces = [piece.piece_index];
      let choice = null;
      if (piece.piece_index === 3) {
        choice = selectedOption === 0 ? "business" : "career";
      }
      db.prepare(`
        INSERT INTO user_station_progress (user_id, company_id, pieces, choice)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, piece.company_id, JSON.stringify(pieces), choice);
    }

    // Update user progress score
    db.prepare("UPDATE user_progress SET score = score + ?, updated_at = datetime('now') WHERE user_id = ?").run(piece.score, req.user.id);

    // Check achievements
    const progress = db.prepare("SELECT * FROM user_progress WHERE user_id = ?").get(req.user.id);
    const stations = db.prepare("SELECT * FROM user_station_progress WHERE user_id = ?").all(req.user.id);
    const completedStations = stations.filter(s => JSON.parse(s.pieces).length >= 4).length;

    if (completedStations >= 1) unlockAchievement(db, req.user.id, "first_station");
    if (completedStations >= 3) unlockAchievement(db, req.user.id, "equator");
    if (completedStations >= 6) unlockAchievement(db, req.user.id, "finalist");

    // Update level
    const levels = db.prepare("SELECT * FROM level_thresholds ORDER BY sort_order DESC").all();
    let newLevel = "новичок";
    for (const l of levels) {
      if (progress.score >= l.min_score) { newLevel = l.level_name; break; }
    }
    db.prepare("UPDATE user_progress SET level = ?, updated_at = datetime('now') WHERE user_id = ?").run(newLevel, req.user.id);

    res.json({ ok: true, score_awarded: piece.score, is_correct: isCorrect });
  } catch (err) {
    next(err);
  }
});

function unlockAchievement(db, userId, achievementId) {
  try {
    db.prepare("INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)").run(userId, achievementId);
  } catch {}
}

export default router;