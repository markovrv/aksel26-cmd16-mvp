import { initDb, getDb, closeDb } from "./connection.js";

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Школьник',
  role TEXT NOT NULL DEFAULT 'student',
  school TEXT DEFAULT NULL,
  region TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track TEXT DEFAULT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'новичок',
  skills_initiative INTEGER NOT NULL DEFAULT 30,
  skills_analytics INTEGER NOT NULL DEFAULT 30,
  skills_team INTEGER NOT NULL DEFAULT 30,
  avatar_created INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_id_unique ON user_progress(user_id);

CREATE TABLE IF NOT EXISTS user_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  answer_index INTEGER NOT NULL,
  score INTEGER NOT NULL,
  skill TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_question ON user_answers(user_id, question_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_answers_unique ON user_answers(user_id, question_id);

CREATE TABLE IF NOT EXISTS user_station_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id),
  pieces TEXT NOT NULL DEFAULT '[]',
  choice TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_station_progress ON user_station_progress(user_id, company_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_station_progress_unique ON user_station_progress(user_id, company_id);

CREATE TABLE IF NOT EXISTS user_task_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id),
  task_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_task_results ON user_task_results(user_id, company_id, task_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_task_results_unique ON user_task_results(user_id, company_id, task_id);

CREATE TABLE IF NOT EXISTS user_station_piece_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id),
  piece_index INTEGER NOT NULL,
  selected_option INTEGER NOT NULL,
  is_correct INTEGER DEFAULT NULL,
  score_awarded INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_piece_answers ON user_station_piece_answers(user_id, company_id, piece_index);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_piece_answers_unique ON user_station_piece_answers(user_id, company_id, piece_index);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id),
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS user_avatar (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  skin TEXT NOT NULL DEFAULT '#f0b38f',
  hair TEXT NOT NULL DEFAULT '#37251c',
  suit TEXT NOT NULL DEFAULT '#536dfe',
  hair_style TEXT DEFAULT 'default',
  suit_style TEXT DEFAULT 'default',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id),
  tour_date TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_tours_user_id ON user_tours(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tours_status ON user_tours(status);

CREATE TABLE IF NOT EXISTS user_game_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profession TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_user_game_history ON user_game_history(user_id, profession);

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short TEXT NOT NULL,
  type TEXT NOT NULL,
  accent TEXT NOT NULL,
  history TEXT NOT NULL,
  products TEXT NOT NULL,
  careers TEXT NOT NULL,
  partners TEXT NOT NULL,
  game_profession TEXT DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS station_pieces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  piece_index INTEGER NOT NULL,
  track TEXT DEFAULT NULL,
  title TEXT NOT NULL,
  visual TEXT NOT NULL,
  facts TEXT NOT NULL,
  task_question TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_option_index INTEGER DEFAULT NULL,
  score INTEGER NOT NULL DEFAULT 20,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_station_pieces ON station_pieces(company_id, piece_index, track);
CREATE UNIQUE INDEX IF NOT EXISTS idx_station_pieces_unique ON station_pieces(company_id, piece_index, COALESCE(track, '__NULL__'));

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  text TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS question_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  text TEXT NOT NULL,
  score INTEGER NOT NULL,
  skill TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_question_answers_question ON question_answers(question_id);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  condition_key TEXT NOT NULL,
  is_game INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS final_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT NOT NULL,
  steps TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT NOT NULL REFERENCES companies(id),
  profession TEXT NOT NULL,
  task_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_type TEXT NOT NULL,
  max_score INTEGER NOT NULL,
  config_json TEXT DEFAULT '{}',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tasks_company_profession ON tasks(company_id, profession, task_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_unique ON tasks(company_id, profession, task_number);

CREATE TABLE IF NOT EXISTS task_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  text TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0,
  option_key TEXT DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS idx_task_options_task ON task_options(task_id);

CREATE TABLE IF NOT EXISTS scoring_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_number INTEGER NOT NULL UNIQUE,
  base_score INTEGER NOT NULL,
  bonus_threshold_ms INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS level_thresholds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level_name TEXT NOT NULL UNIQUE,
  min_score INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS game_workers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  color TEXT NOT NULL,
  correct_zone TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS game_doc_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  row_index INTEGER NOT NULL,
  act_text TEXT NOT NULL,
  norm_text TEXT NOT NULL,
  is_error INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
`;

export async function runMigrations(reset = false) {
  await initDb();
  const db = getDb();

  if (reset) {
    console.log("[migrate] Dropping all tables...");
    const tables = [
      "refresh_tokens", "user_game_history", "user_tours", "user_avatar",
      "user_achievements", "user_station_piece_answers", "user_task_results",
      "user_station_progress", "user_answers", "user_progress", "users",
      "game_doc_rows", "game_workers", "level_thresholds", "scoring_config",
      "task_options", "tasks", "final_results", "achievements",
      "question_answers", "questions", "station_pieces", "companies"
    ];
    for (const t of tables) {
      db.exec(`DROP TABLE IF EXISTS ${t}`);
    }
  }

  console.log("[migrate] Creating tables...");

  // Split by semicolons and execute each statement
  const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    try {
      db.exec(stmt + ";");
    } catch (e) {
      console.error("[migrate] Error executing:", stmt.substring(0, 60), e.message);
    }
  }

  console.log("[migrate] All tables created successfully.");
  closeDb();
}

// CLI
const isReset = process.argv.includes("--reset");
runMigrations(isReset).catch(err => {
  console.error("[migrate] Error:", err);
  process.exit(1);
});