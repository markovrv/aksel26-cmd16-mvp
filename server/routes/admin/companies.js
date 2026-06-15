import { Router } from "express";
import { body } from "express-validator";
import { getDb } from "../../db/connection.js";
import validate from "../../middleware/validate.js";

const router = Router();

// GET /api/admin/companies
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const companies = db.prepare("SELECT * FROM companies ORDER BY sort_order").all();
    res.json(companies);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/companies
router.post("/", [
  body("id").notEmpty(),
  body("name").notEmpty(),
  body("short").notEmpty(),
  body("type").notEmpty(),
  body("accent").notEmpty(),
  body("history").notEmpty(),
  body("products").notEmpty(),
  body("careers").notEmpty(),
  body("partners").notEmpty(),
  validate,
], (req, res, next) => {
  try {
    const db = getDb();
    const { id, name, short, type, accent, history, products, careers, partners, game_profession, sort_order, is_active } = req.body;

    db.prepare(`
      INSERT INTO companies (id, name, short, type, accent, history, products, careers, partners, game_profession, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, short, type, accent, history, JSON.stringify(products), JSON.stringify(careers), JSON.stringify(partners), game_profession || null, sort_order || 0, is_active !== undefined ? is_active : 1);

    const company = db.prepare("SELECT * FROM companies WHERE id = ?").get(id);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/companies/:id
router.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { name, short, type, accent, history, products, careers, partners, game_profession, sort_order, is_active } = req.body;

    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (short !== undefined) { fields.push("short = ?"); values.push(short); }
    if (type !== undefined) { fields.push("type = ?"); values.push(type); }
    if (accent !== undefined) { fields.push("accent = ?"); values.push(accent); }
    if (history !== undefined) { fields.push("history = ?"); values.push(history); }
    if (products !== undefined) { fields.push("products = ?"); values.push(JSON.stringify(products)); }
    if (careers !== undefined) { fields.push("careers = ?"); values.push(JSON.stringify(careers)); }
    if (partners !== undefined) { fields.push("partners = ?"); values.push(JSON.stringify(partners)); }
    if (game_profession !== undefined) { fields.push("game_profession = ?"); values.push(game_profession); }
    if (sort_order !== undefined) { fields.push("sort_order = ?"); values.push(sort_order); }
    if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(req.params.id);
      db.prepare(`UPDATE companies SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }

    const company = db.prepare("SELECT * FROM companies WHERE id = ?").get(req.params.id);
    res.json(company);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/companies/:id
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM companies WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: "Предприятие не найдено" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;