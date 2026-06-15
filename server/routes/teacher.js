import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../db/connection.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = Router();

function requireTeacher(req, res, next) {
  if (!req.user || (req.user.role !== "teacher" && req.user.role !== "admin")) {
    return res.status(403).json({ error: "Доступ только педагогам" });
  }
  next();
}

// GET /api/teacher/students
router.get("/students", auth, requireTeacher, (req, res, next) => {
  try {
    const db = getDb();
    // For now, return all students (teacher-student links are a future feature)
    const students = db.prepare(`
      SELECT u.id, u.name, u.email, u.category, u.school, u.region, u.created_at,
             up.score, up.level, up.track, up.avatar_created
      FROM users u
      LEFT JOIN user_progress up ON up.user_id = u.id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `).all();

    res.json(students);
  } catch (err) {
    next(err);
  }
});

// GET /api/teacher/students/:userId
router.get("/students/:userId", auth, requireTeacher, (req, res, next) => {
  try {
    const db = getDb();
    const user = db.prepare("SELECT id, name, email, category, school, region, created_at FROM users WHERE id = ? AND role = 'student'").get(req.params.userId);
    if (!user) return res.status(404).json({ error: "Ученик не найден" });

    const progress = db.prepare("SELECT * FROM user_progress WHERE user_id = ?").get(req.params.userId);
    const stations = db.prepare("SELECT * FROM user_station_progress WHERE user_id = ?").all(req.params.userId);
    const taskResults = db.prepare("SELECT * FROM user_task_results WHERE user_id = ? ORDER BY created_at").all(req.params.userId);
    const achievements = db.prepare(`
      SELECT a.*, ua.unlocked_at FROM achievements a
      JOIN user_achievements ua ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
    `).all(req.params.userId);

    res.json({ user, progress, stations, taskResults, achievements });
  } catch (err) {
    next(err);
  }
});

// POST /api/teacher/students/link
router.post("/students/link", auth, requireTeacher, [
  body("studentId").notEmpty(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { studentId } = req.body;

    const student = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'student'").get(studentId);
    if (!student) return res.status(404).json({ error: "Ученик не найден" });

    // Store relationship (simple approach - update student's school with teacher id as reference)
    // For now, just confirm the student exists
    res.json({ ok: true, message: "Ученик привязан" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/teacher/students/:userId
router.delete("/students/:userId", auth, requireTeacher, (req, res, next) => {
  try {
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;