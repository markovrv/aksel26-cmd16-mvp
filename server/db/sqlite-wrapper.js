// Compatibility wrapper that provides a better-sqlite3-like API using sql.js
import initSqlJs from "sql.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let SQL = null;
let db = null;
let dbPath = null;

class Statement {
  constructor(sqlDb, sql, params) {
    this.sqlDb = sqlDb;
    this.sql = sql;
    this.params = params || [];
  }

  run(...bindParams) {
    const p = this.params.length > 0 ? this.params : bindParams;
    try {
      this.sqlDb.run(this.sql, p);
      return { changes: this.sqlDb.getRowsModified(), lastInsertRowid: 0 };
    } catch (e) {
      throw e;
    }
  }

  get(...bindParams) {
    const p = this.params.length > 0 ? this.params : bindParams;
    try {
      const stmt = this.sqlDb.prepare(this.sql);
      if (stmt.getAsObject(p)) {
        const result = stmt.getAsObject(p);
        stmt.free();
        return result;
      }
      stmt.free();
      return undefined;
    } catch (e) {
      return undefined;
    }
  }

  all(...bindParams) {
    const p = this.params.length > 0 ? this.params : bindParams;
    try {
      const stmt = this.sqlDb.prepare(this.sql);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (e) {
      return [];
    }
  }
}

export async function initDatabase(dbFilePath) {
  SQL = await initSqlJs();
  dbPath = dbFilePath;

  // Ensure directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Try to load existing database
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not initialized. Call initDatabase() first.");
  return db;
}

export function saveDatabase() {
  if (!db || !dbPath) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export function closeDb() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

// Wrapper functions that match better-sqlite3 API
export function dbPrepare(sql) {
  return new Statement(getDb(), sql);
}

export function dbExec(sql) {
  getDb().run(sql);
}

// Run a transaction (callback-based, using save/restore)
export function dbTransaction(callback) {
  return function(...args) {
    const d = getDb();
    d.run("BEGIN TRANSACTION");
    try {
      callback(...args);
      d.run("COMMIT");
      saveDatabase();
    } catch (e) {
      d.run("ROLLBACK");
      throw e;
    }
  };
}