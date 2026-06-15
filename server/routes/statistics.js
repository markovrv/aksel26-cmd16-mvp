import { Router } from "express";
import { getDb } from "../db/connection.js";

const router = Router();

// GET /api/statistics/professions
router.get("/professions", (req, res, next) => {
  try {
    const db = getDb();
    const professions = db.prepare(`
      SELECT profession, COUNT(*) as count FROM user_game_history
      GROUP BY profession
    `).all();

    const total = professions.reduce((sum, p) => sum + p.count, 0);
    res.json({
      professions: professions.map(p => ({
        name: p.profession,
        count: p.count,
        percentage: total > 0 ? Math.round((p.count / total) * 100) : 0,
      })),
      total,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/statistics/scores
router.get("/scores", (req, res, next) => {
  try {
    const db = getDb();
    const scores = db.prepare(`
      SELECT c.id, c.short, c.name,
             AVG(utr.score) as avg_score,
             COUNT(utr.id) as total_tasks,
             SUM(utr.correct) as correct_tasks
      FROM user_task_results utr
      JOIN companies c ON c.id = utr.company_id
      GROUP BY c.id
    `).all();

    res.json(scores);
  } catch (err) {
    next(err);
  }
});

// GET /api/statistics/tracks
router.get("/tracks", (req, res, next) => {
  try {
    const db = getDb();
    const tracks = db.prepare(`
      SELECT track, COUNT(*) as count FROM user_progress
      WHERE track IS NOT NULL
      GROUP BY track
    `).all();

    const total = tracks.reduce((sum, t) => sum + t.count, 0);
    res.json({
      tracks: tracks.map(t => ({
        name: t.track,
        count: t.count,
        percentage: total > 0 ? Math.round((t.count / total) * 100) : 0,
      })),
      total,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/statistics/global
router.get("/global", (req, res, next) => {
  try {
    const db = getDb();
    const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'").get().c;
    const withProgress = db.prepare("SELECT COUNT(*) as c FROM user_progress WHERE score > 0").get().c;
    const withTrack = db.prepare("SELECT COUNT(*) as c FROM user_progress WHERE track IS NOT NULL").get().c;
    const avgScore = db.prepare("SELECT AVG(score) as avg FROM user_progress").get().avg || 0;
    const totalTasks = db.prepare("SELECT COUNT(*) as c FROM user_task_results").get().c;
    const totalStationsDone = db.prepare("SELECT COUNT(*) as c FROM user_station_piece_answers").get().c;
    const totalGamePlays = db.prepare("SELECT COUNT(*) as c FROM user_game_history").get().c;

    res.json({
      totalUsers,
      withProgress,
      withTrack,
      avgScore: Math.round(avgScore * 10) / 10,
      totalTasks,
      totalStationsDone,
      totalGamePlays,
    });
  } catch (err) {
    next(err);
  }
});

export default router;