
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Путь к базе данных в корне проекта
const dbPath = path.resolve(process.cwd(), 'vpn.db');
const db = new Database(dbPath);

// Настройка базы данных
db.pragma('journal_mode = WAL');

// Инициализация таблицы пользователей
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Функция для гарантированного создания начальных данных
function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    const salt = 10;
    const adminPass = bcrypt.hashSync('admin', salt);
    const userPass = bcrypt.hashSync('user', salt);

    const insert = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    
    try {
      insert.run('admin', adminPass, 'admin');
      insert.run('user', userPass, 'user');
      console.log('--- БАЗА ДАННЫХ ИНИЦИАЛИЗИРОВАНА: admin/admin, user/user ---');
    } catch (e) {
      console.error('Ошибка при сидировании БД:', e);
    }
  }
}

seedDatabase();

export default db;
