-- Migration to add allowed_teachers table
CREATE TABLE IF NOT EXISTS allowed_teachers (
  email TEXT PRIMARY KEY,
  added_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL
);
