import { Router } from "express";
import { getDb } from "../../db/connection.js";

const router = Router();

// GET /api/admin/exports/users
router.get("/users", (req, res, next) => {
  try {
    const db = getDb();
    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.category, u.role, u.school, u.region, u.created_at,
             up.score, up.level, up.track
      FROM users u
      LEFT JOIN user_progress up ON up.user_id = u.id
      ORDER BY u.created_at DESC
    `).all();

    const csv = [
      "id;name;email;category;role;school;region;created_at;score;level;track",
      ...users.map(u => `${u.id};${u.name};${u.email};${u.category};${u.role};${u.school || ""};${u.region || ""};${u.created_at};${u.score || 0};${u.level || "новичок"};${u.track || ""}`)
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send("\uFEFF" + csv);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/exports/progress
router.get("/progress", (req, res, next) => {
  try {
    const db = getDb();
    const progress = db.prepare(`
      SELECT u.id as user_id, u.name, u.email,
             up.score, up.level, up.track, up.skills_initiative, up.skills_analytics, up.skills_team, up.avatar_created,
             (SELECT COUNT(*) FROM user_station_progress usp WHERE usp.user_id = u.id AND json_array_length(usp.pieces) >= 4) as stations_completed
      FROM users u
      LEFT JOIN user_progress up ON up.user_id = u.id
      WHERE u.role = 'student'
      ORDER BY u.name
    `).all();

    const csv = [
      "user_id;name;email;score;level;track;initiative;analytics;team;avatar_created;stations_completed",
      ...progress.map(p => `${p.user_id};${p.name};${p.email};${p.score || 0};${p.level || "новичок"};${p.track || ""};${p.skills_initiative || 30};${p.skills_analytics || 30};${p.skills_team || 30};${p.avatar_created};${p.stations_completed}`)
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=progress.csv");
    res.send("\uFEFF" + csv);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/exports/tours
router.get("/tours", (req, res, next) => {
  try {
    const db = getDb();
    const tours = db.prepare(`
      SELECT ut.id, u.name, u.email, c.short as company, ut.tour_date, ut.phone, ut.status, ut.created_at
      FROM user_tours ut
      JOIN users u ON u.id = ut.user_id
      JOIN companies c ON c.id = ut.company_id
      ORDER BY ut.created_at DESC
    `).all();

    const csv = [
      "id;name;email;company;date;phone;status;created_at",
      ...tours.map(t => `${t.id};${t.name};${t.email};${t.company};${t.tour_date};${t.phone};${t.status};${t.created_at}`)
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=tours.csv");
    res.send("\uFEFF" + csv);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/exports/full
router.get("/full", (req, res, next) => {
  try {
    const db = getDb();
    const dump = {
      users: db.prepare("SELECT id, name, email, category, role, school, region, created_at FROM users").all(),
      companies: db.prepare("SELECT * FROM companies").all(),
      station_pieces: db.prepare("SELECT * FROM station_pieces").all(),
      questions: (() => {
        const qs = db.prepare("SELECT * FROM questions").all();
        for (const q of qs) {
          q.answers = db.prepare("SELECT * FROM question_answers WHERE question_id = ?").all(q.id);
        }
        return qs;
      })(),
      achievements: db.prepare("SELECT * FROM achievements").all(),
      final_results: db.prepare("SELECT * FROM final_results").all(),
      tasks: (() => {
        const ts = db.prepare("SELECT * FROM tasks").all();
        for (const t of ts) {
          t.options = db.prepare("SELECT * FROM task_options WHERE task_id = ?").all(t.id);
        }
        return ts;
      })(),
      scoring_config: db.prepare("SELECT * FROM scoring_config").all(),
      level_thresholds: db.prepare("SELECT * FROM level_thresholds").all(),
      game_workers: db.prepare("SELECT * FROM game_workers").all(),
      game_doc_rows: db.prepare("SELECT * FROM game_doc_rows").all(),
    };

    res.json(dump);
  } catch (err) {
    next(err);
  }
});

export default router;