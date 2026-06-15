import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import initSqlJs from "sql.js";
import fs from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = join(__dirname, "marshrutka.sqlite");

let db = null;
let dbPath = null;
let dbInitialized = false;

class Statement {
  constructor(sqlDb, sql) {
    this.sqlDb = sqlDb;
    this.sql = sql;
    this._stmt = null;
  }

  _prepare() {
    if (!this._stmt) {
      this._stmt = this.sqlDb.prepare(this.sql);
    }
    return this._stmt;
  }

  run(...params) {
    const flatParams = params.flat();
    try {
      this.sqlDb.run(this.sql, flatParams);
      // Save after mutation
      saveDb();
      // Try to get the last insert rowid
      let lastId = 0;
      try {
        const result = this.sqlDb.exec("SELECT last_insert_rowid() as id");
        if (result && result[0] && result[0].values && result[0].values[0]) {
          lastId = result[0].values[0][0];
        }
      } catch {}
      return { changes: this.sqlDb.getRowsModified(), lastInsertRowid: lastId };
    } catch (e) {
      console.error("[SQL Error run]", this.sql, flatParams, e.message);
      throw e;
    }
  }

  get(...params) {
    const flatParams = params.flat();
    try {
      const stmt = this._prepare();
      if (flatParams.length > 0) stmt.bind(flatParams);
      const result = stmt.step() ? stmt.getAsObject() : undefined;
      return result;
    } catch (e) {
      return undefined;
    }
  }

  all(...params) {
    const flatParams = params.flat();
    try {
      const stmt = this.sqlDb.prepare(this.sql);
      if (flatParams.length > 0) stmt.bind(flatParams);
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

function saveDb() {
  if (!db || !dbPath) return;
  try {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (e) {
    console.error("[saveDb]", e.message);
  }
}

export async function initDb() {
  if (dbInitialized) return db;

  const SQL = await initSqlJs();
  dbPath = process.env.DB_PATH || DEFAULT_DB_PATH;
  const dir = dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");
  dbInitialized = true;
  console.log("[db] Initialized:", dbPath);
  return db;
}

export function getDb() {
  if (!dbInitialized || !db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  // Return a database-like object with .prepare() for compatibility
  return {
    prepare: (sql) => new Statement(db, sql),
    exec: (sql) => { db.run(sql); saveDb(); },
    close: () => { saveDb(); db.close(); dbInitialized = false; },
  };
}

export function closeDb() {
  if (db) {
    saveDb();
    db.close();
    db = null;
    dbInitialized = false;
  }
}