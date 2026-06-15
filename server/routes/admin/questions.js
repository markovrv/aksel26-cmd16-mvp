import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../../db/connection.js";
import validate from "../../middleware/validate.js";

const router = Router();

// GET /api/admin/questions
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const questions = db.prepare("SELECT * FROM questions ORDER BY sort_order").all();
    for (const q of questions) {
      q.answers = db.prepare("SELECT * FROM question_answers WHERE question_id = ? ORDER BY sort_order").all(q.id);
    }
    res.json(questions);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/questions
router.post("/", [
  body("text").notEmpty(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { text, sort_order, is_active } = req.body;
    db.prepare("INSERT INTO questions (sort_order, text, is_active) VALUES (?, ?, ?)").run(sort_order || 0, text, is_active !== undefined ? is_active : 1);
    const question = db.prepare("SELECT * FROM questions ORDER BY id DESC LIMIT 1").get();
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/questions/:id
router.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { text, sort_order, is_active } = req.body;
    const fields = [];
    const values = [];
    if (text !== undefined) { fields.push("text = ?"); values.push(text); }
    if (sort_order !== undefined) { fields.push("sort_order = ?"); values.push(sort_order); }
    if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active); }
    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(parseInt(req.params.id));
      db.prepare(`UPDATE questions SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
    const question = db.prepare("SELECT * FROM questions WHERE id = ?").get(parseInt(req.params.id));
    res.json(question);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/questions/:id
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM questions WHERE id = ?").run(parseInt(req.params.id));
    if (result.changes === 0) return res.status(404).json({ error: "Вопрос не найден" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/questions/:id/answers
router.post("/:id/answers", [
  body("text").notEmpty(),
  body("score").isInt(),
  body("skill").isIn(["initiative", "analytics", "team"]),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { text, score, skill } = req.body;
    const maxSort = db.prepare("SELECT MAX(sort_order) as m FROM question_answers WHERE question_id = ?").get(parseInt(req.params.id));
    const result = db.prepare("INSERT INTO question_answers (question_id, sort_order, text, score, skill) VALUES (?, ?, ?, ?, ?)").run(
      parseInt(req.params.id), (maxSort?.m || -1) + 1, text, score, skill
    );
    const answer = db.prepare("SELECT * FROM question_answers WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(answer);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/questions/:qid/answers/:aid
router.put("/:qid/answers/:aid", (req, res, next) => {
  try {
    const db = getDb();
    const { text, score, skill } = req.body;
    const fields = [];
    const values = [];
    if (text !== undefined) { fields.push("text = ?"); values.push(text); }
    if (score !== undefined) { fields.push("score = ?"); values.push(score); }
    if (skill !== undefined) { fields.push("skill = ?"); values.push(skill); }
    if (fields.length > 0) {
      values.push(parseInt(req.params.aid));
      db.prepare(`UPDATE question_answers SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
    const answer = db.prepare("SELECT * FROM question_answers WHERE id = ?").get(parseInt(req.params.aid));
    res.json(answer);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/questions/:qid/answers/:aid
router.delete("/:qid/answers/:aid", (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM question_answers WHERE id = ?").run(parseInt(req.params.aid));
    if (result.changes === 0) return res.status(404).json({ error: "Ответ не найден" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;