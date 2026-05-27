// ============================================================
// PRISM — SQLite Database Layer (better-sqlite3)
// All tables are created on first run automatically.
// ============================================================
const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_DIR  = path.join(__dirname, '../../db');
const DB_PATH = path.join(DB_DIR, 'prism.db');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    phone       TEXT DEFAULT '',
    role        TEXT DEFAULT 'user',
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS properties_cache (
    id              INTEGER PRIMARY KEY,
    city            TEXT,
    locality        TEXT,
    bhk             INTEGER,
    sqft            REAL,
    price           REAL,
    risk_score      INTEGER,
    risk_label      TEXT,
    rera            INTEGER DEFAULT 0,
    rtm             INTEGER DEFAULT 0,
    resale          INTEGER DEFAULT 0,
    under_const     INTEGER DEFAULT 0,
    type            TEXT,
    posted_by       TEXT,
    purpose         TEXT,
    lat             REAL DEFAULT 0,
    lng             REAL DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS favourites (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL,
    property_id   TEXT NOT NULL,
    property_json TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, property_id)
  );

  CREATE TABLE IF NOT EXISTS mails (
    id          TEXT PRIMARY KEY,
    user_id     TEXT,
    from_addr   TEXT NOT NULL,
    to_addr     TEXT NOT NULL,
    subject     TEXT NOT NULL,
    body        TEXT NOT NULL,
    unread      INTEGER DEFAULT 1,
    direction   TEXT DEFAULT 'received',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS predictions (
    id            TEXT PRIMARY KEY,
    user_id       TEXT,
    input_json    TEXT NOT NULL,
    result_json   TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS registry_checks (
    id           TEXT PRIMARY KEY,
    user_id      TEXT,
    rera_id      TEXT,
    city         TEXT,
    owner        TEXT,
    result_json  TEXT,
    created_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_tickets (
    id          TEXT PRIMARY KEY,
    user_id     TEXT,
    name        TEXT,
    email       TEXT,
    phone       TEXT,
    subject     TEXT,
    message     TEXT,
    status      TEXT DEFAULT 'open',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_properties_city  ON properties_cache(city);
  CREATE INDEX IF NOT EXISTS idx_properties_price ON properties_cache(price);
  CREATE INDEX IF NOT EXISTS idx_properties_risk  ON properties_cache(risk_label);
  CREATE INDEX IF NOT EXISTS idx_properties_bhk   ON properties_cache(bhk);
  CREATE INDEX IF NOT EXISTS idx_favourites_user  ON favourites(user_id);
  CREATE INDEX IF NOT EXISTS idx_mails_to         ON mails(to_addr);
  CREATE INDEX IF NOT EXISTS idx_mails_user       ON mails(user_id);
  CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
`);

// ── Helper to generate unique IDs ─────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Generic CRUD helpers ──────────────────────────────────────

function insert(table, data) {
  if (!data.id) data.id = genId();
  const cols = Object.keys(data);
  const vals = cols.map(c => data[c]);
  const ph   = cols.map(() => '?').join(', ');
  db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${ph})`).run(...vals);
  return data;
}

function findOne(table, where) {
  const clauses = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
  return db.prepare(`SELECT * FROM ${table} WHERE ${clauses} LIMIT 1`).get(...Object.values(where)) || null;
}

function findAll(table, where = {}, orderBy = 'created_at DESC') {
  if (!Object.keys(where).length) {
    return db.prepare(`SELECT * FROM ${table} ORDER BY ${orderBy}`).all();
  }
  const clauses = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
  return db.prepare(`SELECT * FROM ${table} WHERE ${clauses} ORDER BY ${orderBy}`).all(...Object.values(where));
}

function update(table, where, data) {
  const sets    = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const clauses = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
  db.prepare(`UPDATE ${table} SET ${sets} WHERE ${clauses}`).run(...Object.values(data), ...Object.values(where));
  return findOne(table, where);
}

function remove(table, where) {
  const clauses = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
  return db.prepare(`DELETE FROM ${table} WHERE ${clauses}`).run(...Object.values(where)).changes > 0;
}

function query(sql, params = []) {
  return db.prepare(sql).all(...params);
}

function run(sql, params = []) {
  return db.prepare(sql).run(...params);
}

function count(table, where = {}) {
  if (!Object.keys(where).length)
    return db.prepare(`SELECT COUNT(*) as n FROM ${table}`).get().n;
  const clauses = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
  return db.prepare(`SELECT COUNT(*) as n FROM ${table} WHERE ${clauses}`).get(...Object.values(where)).n;
}

module.exports = { db, genId, insert, findOne, findAll, update, remove, query, run, count };
