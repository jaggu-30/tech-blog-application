import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../config/db.js';

export function createBlog({ title, category, content, authorId }) {
  const db = getDB();
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO blogs (id, title, category, content, author_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, title, category, content, authorId, now, now);

  return findBlogById(id);
}

export function findAllBlogs() {
  const db = getDB();
  const stmt = db.prepare(`
    SELECT b.id, b.title, b.category, b.content, b.author_id, b.created_at, b.updated_at,
           u.name AS author_name, u.email AS author_email
    FROM blogs b
    LEFT JOIN users u ON b.author_id = u.id
    ORDER BY b.created_at DESC
  `);

  return stmt.all().map(formatRow);
}

export function findBlogsByAuthor(authorId) {
  const db = getDB();
  const stmt = db.prepare(`
    SELECT b.id, b.title, b.category, b.content, b.author_id, b.created_at, b.updated_at,
           u.name AS author_name, u.email AS author_email
    FROM blogs b
    LEFT JOIN users u ON b.author_id = u.id
    WHERE b.author_id = ?
    ORDER BY b.created_at DESC
  `);

  return stmt.all(authorId).map(formatRow);
}

export function findBlogById(id) {
  const db = getDB();
  const stmt = db.prepare(`
    SELECT b.id, b.title, b.category, b.content, b.author_id, b.created_at, b.updated_at,
           u.name AS author_name, u.email AS author_email
    FROM blogs b
    LEFT JOIN users u ON b.author_id = u.id
    WHERE b.id = ?
  `);

  const row = stmt.get(id);
  if (!row) return null;

  return formatRow(row);
}

export function deleteBlogById(id) {
  const db = getDB();
  const blog = findBlogById(id);
  if (!blog) return null;

  const stmt = db.prepare('DELETE FROM blogs WHERE id = ?');
  stmt.run(id);

  return blog;
}

function formatRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    author: row.author_name || 'Anonymous',
    authorId: row.author_id,
    initial: (row.author_name || 'A').charAt(0).toUpperCase(),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
