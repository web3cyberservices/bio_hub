
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Используем абсолютный путь к корню проекта
const dbPath = path.resolve(process.cwd(), 'vpn.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Инициализация таблиц
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
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    if (row.count === 0) {
      console.log('--- Инициализация начальных пользователей ---');
      const salt = 10;
      // Используем bcryptjs для гарантии совместимости
      const adminPass = bcrypt.hashSync('admin', salt);
      const userPass = bcrypt.hashSync('user', salt);

      const insert = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
      
      insert.run('admin', adminPass, 'admin');
      insert.run('user', userPass, 'user');
      console.log('--- Тестовые аккаунты созданы: admin/admin, user/user ---');
    }
  } catch (e) {
    console.error('Ошибка при сидировании базы данных:', e);
  }
}

seedDatabase();

export default db;
