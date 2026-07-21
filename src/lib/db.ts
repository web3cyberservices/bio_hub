
import Database from 'better-sqlite3';
import path from 'path';

// Файл базы данных будет лежать в корне проекта под именем vpn.db
const dbPath = path.resolve(process.cwd(), 'vpn.db');
const db = new Database(dbPath);

// Инициализация таблицы пользователей, если её нет
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
