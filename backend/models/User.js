import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../config/db.js';

export function createUser({ name, email, password }) {
  const db = getDB();
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, name, email, password, now, now);

  return findUserById(id);
}

export function findUserByEmail(email, includePassword = false) {
  const db = getDB();
  const columns = includePassword
    ? 'id, name, email, password, created_at, updated_at'
    : 'id, name, email, created_at, updated_at';

  const stmt = db.prepare(`SELECT ${columns} FROM users WHERE email = ?`);
  const row = stmt.get(email);

  if (!row) return null;

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    ...(includePassword ? { password: row.password } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function findUserById(id) {
  const db = getDB();
  const stmt = db.prepare(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?'
  );
  const row = stmt.get(id);

  if (!row) return null;

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
