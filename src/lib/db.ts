
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'vpn.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function seedDatabase() {
  const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (row.count === 0) {
    const salt = 10;
    const adminPass = bcrypt.hashSync('admin', salt);
    const userPass = bcrypt.hashSync('user', salt);

    const insert = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    
    try {
      insert.run('admin', adminPass, 'admin');
      insert.run('user', userPass, 'user');
    } catch (e) {
      // Игнорируем ошибки при вставке если они уже есть
    }
  }
}

seedDatabase();

export default db;
