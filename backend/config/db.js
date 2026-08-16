import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'inkly.db');

let db;

export function connectDB() {
  if (db) return db;

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);
    CREATE INDEX IF NOT EXISTS idx_blogs_created ON blogs(created_at);
  `);

  console.log(`SQLite database connected: ${DB_PATH}`);
  return db;
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}
