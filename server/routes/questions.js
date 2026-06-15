import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../db/connection.js";
import auth from "../middleware/auth.js";
import { optionalAuth } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

// GET /api/questions
router.get("/", optionalAuth, (req, res, next) => {
  try {
    const db = getDb();
    const questions = db.prepare("SELECT * FROM questions WHERE is_active = 1 ORDER BY sort_order").all();

    for (const q of questions) {
      q.answers = db.prepare("SELECT * FROM question_answers WHERE question_id = ? ORDER BY sort_order").all(q.id);
    }

    res.json(questions);
  } catch (err) {
    next(err);
  }
});

// POST /api/questions/submit
router.post("/submit", auth, [
  body("answers").isArray({ min: 7, max: 7 }).withMessage("Нужны ответы на все 7 вопросов"),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { answers } = req.body;

    // Check if already answered (by progress track)
    const existingProgress = db.prepare("SELECT track FROM user_progress WHERE user_id = ?").get(req.user.id);
    if (existingProgress && existingProgress.track) {
      return res.status(409).json({ error: "Диагностика уже пройдена" });
    }
    // Delete any stale partial answers from previous failed attempts
    db.prepare("DELETE FROM user_answers WHERE user_id = ?").run(req.user.id);

    // Calculate track and scores
    let initiativeScore = 0;
    let analyticsScore = 0;
    let teamScore = 0;

    const questions = db.prepare("SELECT * FROM questions WHERE is_active = 1 ORDER BY sort_order").all();

    for (let i = 0; i < answers.length; i++) {
      const questionId = questions[i].id;
      const answerIndex = answers[i];

      const answer = db.prepare("SELECT * FROM question_answers WHERE question_id = ? AND sort_order = ?").get(questionId, answerIndex);
      if (!answer) continue;

      db.prepare(
        "INSERT INTO user_answers (user_id, question_id, answer_index, score, skill) VALUES (?, ?, ?, ?, ?)"
      ).run(req.user.id, questionId, answerIndex, answer.score, answer.skill);

      if (answer.skill === "initiative") initiativeScore += answer.score;
      else if (answer.skill === "analytics") analyticsScore += answer.score;
      else if (answer.skill === "team") teamScore += answer.score;
    }

    // Determine track
    const track = initiativeScore > analyticsScore ? "business" : "career";

    // Update user_progress with skills, track, score
    const baseInit = 30, baseAnalytics = 30, baseTeam = 30;
    const finalInit = Math.min(100, baseInit + initiativeScore + (track === "business" ? 20 : 0));
    const finalAnalytics = Math.min(100, baseAnalytics + analyticsScore + (track === "career" ? 20 : 0));
    const finalTeam = Math.min(100, baseTeam + teamScore);

    // Ensure user_progress row exists
    const up = db.prepare("SELECT id FROM user_progress WHERE user_id = ?").get(req.user.id);
    if (!up) {
      db.prepare("INSERT INTO user_progress (user_id, score) VALUES (?, 0)").run(req.user.id);
    }

    db.prepare(`
      UPDATE user_progress SET 
        track = ?,
        score = score + 40,
        skills_initiative = ?, skills_analytics = ?, skills_team = ?,
        updated_at = datetime('now')
      WHERE user_id = ?
    `).run(track, finalInit, finalAnalytics, finalTeam, req.user.id);

    // Unlock achievement
    unlockAchievement(db, req.user.id, "track_found");

    // Update level
    const progress = db.prepare("SELECT score FROM user_progress WHERE user_id = ?").get(req.user.id);
    const currentScore = progress ? progress.score : 40;
    const levels = db.prepare("SELECT * FROM level_thresholds ORDER BY sort_order DESC").all();
    let newLevel = "новичок";
    for (const l of levels) {
      if (currentScore >= l.min_score) { newLevel = l.level_name; break; }
    }
    db.prepare("UPDATE user_progress SET level = ?, updated_at = datetime('now') WHERE user_id = ?").run(newLevel, req.user.id);

    res.json({
      ok: true,
      track,
      skills: { initiative: finalInit, analytics: finalAnalytics, team: finalTeam },
      score_awarded: 40,
    });
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