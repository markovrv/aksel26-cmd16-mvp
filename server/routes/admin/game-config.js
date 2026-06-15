import { Router } from "express";
import { getDb } from "../../db/connection.js";

const workersRouter = Router();
const docRowsRouter = Router();

// === WORKERS ===
workersRouter.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const workers = db.prepare("SELECT * FROM game_workers ORDER BY id").all();
    res.json(workers);
  } catch (err) {
    next(err);
  }
});

workersRouter.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { name, role, color, correct_zone, is_active } = req.body;
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (role !== undefined) { fields.push("role = ?"); values.push(role); }
    if (color !== undefined) { fields.push("color = ?"); values.push(color); }
    if (correct_zone !== undefined) { fields.push("correct_zone = ?"); values.push(correct_zone); }
    if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active); }
    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(parseInt(req.params.id));
      db.prepare(`UPDATE game_workers SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
    const worker = db.prepare("SELECT * FROM game_workers WHERE id = ?").get(parseInt(req.params.id));
    res.json(worker);
  } catch (err) {
    next(err);
  }
});

// === DOC ROWS ===
docRowsRouter.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM game_doc_rows ORDER BY row_index").all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

docRowsRouter.put("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { row_index, act_text, norm_text, is_error, is_active } = req.body;
    const fields = [];
    const values = [];
    if (row_index !== undefined) { fields.push("row_index = ?"); values.push(row_index); }
    if (act_text !== undefined) { fields.push("act_text = ?"); values.push(act_text); }
    if (norm_text !== undefined) { fields.push("norm_text = ?"); values.push(norm_text); }
    if (is_error !== undefined) { fields.push("is_error = ?"); values.push(is_error); }
    if (is_active !== undefined) { fields.push("is_active = ?"); values.push(is_active); }
    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(parseInt(req.params.id));
      db.prepare(`UPDATE game_doc_rows SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }
    const row = db.prepare("SELECT * FROM game_doc_rows WHERE id = ?").get(parseInt(req.params.id));
    res.json(row);
  } catch (err) {
    next(err);
  }
});

export { workersRouter, docRowsRouter };