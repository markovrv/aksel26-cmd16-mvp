import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../db/connection.js";
import auth from "../middleware/auth.js";
import { optionalAuth } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

// GET /api/tasks/:id
router.get("/:id", optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const task = db.prepare("SELECT * FROM tasks WHERE id = ? AND is_active = 1").get(parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: "Задача не найдена" });

    task.options = db.prepare("SELECT * FROM task_options WHERE task_id = ? ORDER BY sort_order").all(task.id);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks/:id/solve
router.post("/:id/solve", auth, [
  body("timeMs").isInt({ min: 0 }),
  body("answers").optional().isArray(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const taskId = parseInt(req.params.id);
    const { answers, timeMs } = req.body;

    const task = db.prepare("SELECT * FROM tasks WHERE id = ? AND is_active = 1").get(taskId);
    if (!task) return res.status(404).json({ error: "Задача не найдена" });

    const options = db.prepare("SELECT * FROM task_options WHERE task_id = ? ORDER BY sort_order").all(taskId);

    // Check if already solved
    const existing = db.prepare(
      "SELECT id FROM user_task_results WHERE user_id = ? AND company_id = ? AND task_id = ?"
    ).get(req.user.id, task.company_id, task.id);

    if (existing) {
      return res.status(409).json({ error: "Задача уже решена" });
    }

    // Calculate score based on task type
    let score = 0;
    let correct = 0;
    const config = JSON.parse(task.config_json || "{}");

    if (task.task_type === "choice" && answers?.length > 0) {
      const selectedOption = options[answers[0]];
      correct = selectedOption?.is_correct ? 1 : 0;
      score = correct ? task.max_score : 0;
    } else if (task.task_type === "checkbox" && answers) {
      const correctSet = new Set(options.filter(o => o.is_correct).map(o => o.id));
      const selectedSet = new Set(answers);
      const allCorrect = correctSet.size === selectedSet.size && [...correctSet].every(id => selectedSet.has(id));
      const partlyCorrect = [...selectedSet].some(id => correctSet.has(id));
      correct = allCorrect ? 1 : 0;
      score = allCorrect ? task.max_score : partlyCorrect ? Math.floor(task.max_score / 2) : 0;
    } else if (task.task_type === "invoice" && answers?.length > 0) {
      correct = answers[0] ? 1 : 0;
      score = correct ? task.max_score : 0;
    } else if (task.task_type === "dragdrop") {
      // answers: { foundation: number[], walls: number[] }
      if (answers) {
        const ans = answers[0] || {};
        const correctFoundation = options.filter(o => o.option_key === "foundation" && o.is_correct).map(o => parseInt(o.text));
        const correctWalls = options.filter(o => o.option_key === "walls" && o.is_correct).map(o => parseInt(o.text));
        const fOk = (ans.foundation || []).length === correctFoundation.length;
        const wOk = (ans.walls || []).length === correctWalls.length;
        if (fOk && wOk) { correct = 1; score = task.max_score; }
        else if (fOk || wOk) { correct = 0; score = Math.floor(task.max_score / 2); }
      }
    } else if (task.task_type === "doccheck") {
      if (answers) {
        const ans = answers[0] || {};
        const correctErrors = options.filter(o => o.is_correct).map(o => parseInt(o.text));
        const foundCorrect = (ans.marked || []).filter(id => correctErrors.includes(id)).length;
        const falseMarks = (ans.marked || []).filter(id => !correctErrors.includes(id)).length;
        if (foundCorrect >= 3 && ans.decision === 1) { correct = 1; score = task.max_score; }
        else if (foundCorrect >= 2 && ans.decision === 1) { correct = 0; score = Math.floor(task.max_score * 0.67); }
        else if (foundCorrect >= 3 && ans.decision === 2) { correct = 0; score = Math.floor(task.max_score * 0.33); }
      }
    } else if (task.task_type === "inspection") {
      if (answers) {
        const ans = answers[0] || {};
        const found = ans.found || 0;
        const falseTaps = ans.falseTaps || 0;
        if (found >= 3 && ans.decision === 1) { correct = 1; score = task.max_score; }
        else if (found >= 2 && ans.decision === 1) { score = Math.floor(task.max_score * 0.7); }
        else if (found >= 3 && ans.decision === 2) { score = Math.floor(task.max_score * 0.5); }
        if (falseTaps === 0 && score > 0) score += 3;
      }
    }

    // Bonus for speed
    const scoring = db.prepare("SELECT * FROM scoring_config WHERE task_number = ?").get(task.task_number);
    if (scoring && correct && timeMs < scoring.bonus_threshold_ms) {
      score += scoring.bonus_points;
    }

    const timeSeconds = Math.floor(timeMs / 1000);

    // Save result
    db.prepare(`
      INSERT INTO user_task_results (user_id, company_id, task_id, score, time_seconds, correct)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, task.company_id, task.id, score, timeSeconds, correct);

    // Update user score
    db.prepare("UPDATE user_progress SET score = score + ?, updated_at = datetime('now') WHERE user_id = ?").run(score, req.user.id);

    // Check achievements
    if (timeMs < 30000 && correct) unlockAchievement(db, req.user.id, "quick_solver");
    if (task.profession === "foreman" && task.task_number === 3 && correct) unlockAchievement(db, req.user.id, "found_solution");
    if (task.profession === "energy" && task.task_number === 2 && correct) unlockAchievement(db, req.user.id, "responsible");
    if (task.profession === "inspector" && task.task_number === 3 && correct) unlockAchievement(db, req.user.id, "honest_inspector");
    if (task.profession === "inspector" && task.task_type === "doccheck" && correct) unlockAchievement(db, req.user.id, "ethical");

    // Update level
    const progress = db.prepare("SELECT score FROM user_progress WHERE user_id = ?").get(req.user.id);
    const levels = db.prepare("SELECT * FROM level_thresholds ORDER BY sort_order DESC").all();
    let newLevel = "новичок";
    for (const l of levels) {
      if (progress.score >= l.min_score) { newLevel = l.level_name; break; }
    }
    db.prepare("UPDATE user_progress SET level = ?, updated_at = datetime('now') WHERE user_id = ?").run(newLevel, req.user.id);

    res.json({ ok: true, score, correct: !!correct, timeSeconds });
  } catch (err) {
    next(err);
  }
});

// POST /api/companies/:cid/solve-all
router.post("/:cid/solve-all", auth, (req, res, next) => {
  try {
    const db = getDb();
    const { cid } = req.params;
    const results = db.prepare(`
      SELECT * FROM user_task_results WHERE user_id = ? AND company_id = ?
    `).all(req.user.id, cid);

    res.json({ results });
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