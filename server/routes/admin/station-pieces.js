import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../../db/connection.js";
import validate from "../../middleware/validate.js";

const router = Router();

// GET /api/admin/station-pieces
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const { company_id } = req.query;
    let pieces;
    if (company_id) {
      pieces = db.prepare("SELECT * FROM station_pieces WHERE company_id = ? ORDER BY piece_index, track").all(company_id);
    } else {
      pieces = db.prepare("SELECT * FROM station_pieces ORDER BY company_id, piece_index, track").all();
    }
    res.json(pieces);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/station-pieces/:id
router.get("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const piece = db.prepare("SELECT * FROM station_pieces WHERE id = ?").get(parseInt(req.params.id));
    if (!piece) return res.status(404).json({ error: "Блок не найден" });
    res.json(piece);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/station-pieces
router.post("/", [
  body("company_id").notEmpty(),
  body("piece_index").isInt({ min: 0, max: 3 }),
  body("title").notEmpty(),
  body("visual").notEmpty(),
  body("facts").notEmpty(),
  body("task_question").notEmpty(),
  body("options").notEmpty(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { company_id, piece_index, track, title, visual, facts, task_question, options, correct_option_index, score, is_active } = req.body;

    const result = db.prepare(`
      INSERT INTO station_pieces (company_id, piece_index, track, title, visual, facts, task_question, options, correct_option_index, score, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(company_id, piece_index, track || null, title, visual, JSON.stringify(facts), task_question, JSON.stringify(options), correct_option_index ?? null, score || 20, is_active !== undefined ? is_active : 1);

    const piece = db.prepare("SELECT * FROM station_pieces WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(piece);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/station-pieces/:id
router.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const id = parseInt(req.params.id);
    const { company_id, piece_index, track, title, visual, facts, task_question, options, correct_option_index, score, is_active } = req.body;

    const fields = [];
    const values = [];
    if (company_id !== undefined) { fields.push("company_id = ?"); values.push(company_id); }
    if (piece_index !== undefined) { fields.push("piece_index = ?"); values.push(piece_index); }
    if (track !== undefined) { fields.push("track = ?"); values.push(track); }
    if (title !== undefined) { fields.push("title = ?"); values.push(title); }
    if (visual !== undefined) { fields.push("visual = ?"); values.push(visual); }
    if (facts !== undefined) { fields.push("facts = ?"); values.push(JSON.stringify(facts)); }
    if (task_question !== undefined) { fields.push("task_question = ?"); values.push(task_question); }
    if (options !== undefined) { fields.push("options = ?"); values.push(JSON.stringify(options)); }
    if (correct_option_index !== undefined) { fields.push("correct_option_index = ?"); values.push(correct_option_index); }
    if (score !== undefined) { fields.push("score = ?"); values.push(score); }
    if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      db.prepare(`UPDATE station_pieces SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }

    const piece = db.prepare("SELECT * FROM station_pieces WHERE id = ?").get(id);
    res.json(piece);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/station-pieces/:id
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM station_pieces WHERE id = ?").run(parseInt(req.params.id));
    if (result.changes === 0) return res.status(404).json({ error: "Блок не найден" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/companies/:cid/pieces/seed
router.post("/:cid/pieces/seed", (req, res, next) => {
  try {
    const db = getDb();
    const { cid } = req.params;
    const company = db.prepare("SELECT * FROM companies WHERE id = ?").get(cid);
    if (!company) return res.status(404).json({ error: "Предприятие не найдено" });

    // Auto-generate 4 generic pieces
    const pieces = [
      { piece_index: 0, track: null, title: "История и масштаб", visual: `${company.short}: предприятие, которое влияет на развитие региона`, facts: [company.history, "Контент будет дополнен"], task_question: "Что важнее для устойчивого предприятия?", options: ["Связь опыта и новых технологий", "Только размер производства"], correct: 0, score: 20 },
      { piece_index: 1, track: "business", title: "Что здесь создают", visual: `Продукты предприятия «${company.short}»`, facts: JSON.parse(company.products), task_question: "Какой продукт можно усилить цифровым сервисом?", options: [JSON.parse(company.products)[0], JSON.parse(company.products)[1]], correct: null, score: 20 },
      { piece_index: 1, track: "career", title: "Что здесь создают", visual: `Продукты предприятия «${company.short}»`, facts: JSON.parse(company.products), task_question: "Какой продукт тебе интереснее изучить изнутри?", options: [JSON.parse(company.products)[0], JSON.parse(company.products)[1]], correct: null, score: 20 },
      { piece_index: 2, track: null, title: "Люди и профессии", visual: "Карьера начинается со знакомства с реальными задачами", facts: JSON.parse(company.careers), task_question: "Какой навык особенно важен для этих профессий?", options: ["Умение учиться и работать в команде", "Умение избегать новых задач"], correct: 0, score: 20 },
      { piece_index: 3, track: "business", title: "Твой бизнес-ход", visual: "Найди точку роста для предприятия", facts: [`Предложи сервис или продукт, который решает одну из задач производства.`, `Потенциальные партнёры: ${JSON.parse(company.partners).join(", ")}.`], task_question: "Как хочешь взаимодействовать с предприятием?", options: ["Как предприниматель-партнёр", "Как сотрудник команды"], correct: null, score: 35 },
      { piece_index: 3, track: "career", title: "Твой карьерный ход", visual: "Выбери роль на предприятии", facts: [`Выбери профессиональную роль и первый шаг к ней.`, `Возможные партнёры обучения: ${JSON.parse(company.partners).join(", ")}.`], task_question: "Как хочешь взаимодействовать с предприятием?", options: ["Как предприниматель-партнёр", "Как сотрудник команды"], correct: null, score: 35 },
    ];

    const insert = db.transaction(() => {
      for (const p of pieces) {
        db.prepare(`
          INSERT OR IGNORE INTO station_pieces (company_id, piece_index, track, title, visual, facts, task_question, options, correct_option_index, score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(cid, p.piece_index, p.track, p.title, p.visual, JSON.stringify(p.facts), p.task_question, JSON.stringify(p.options), p.correct, p.score);
      }
    });
    insert();

    res.json({ ok: true, count: 6 });
  } catch (err) {
    next(err);
  }
});

export default router;