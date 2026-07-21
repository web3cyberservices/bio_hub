
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'vpn.db');
console.log(`[DB] Путь к базе данных: ${dbPath}`);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Инициализация таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    expires_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function seedDatabase() {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    if (row.count === 0) {
      console.log('[DB] Инициализация начальных пользователей...');
      const adminPass = bcrypt.hashSync('admin', 10);
      const userPass = bcrypt.hashSync('user', 10);

      const insert = db.prepare('INSERT INTO users (username, password, role, expires_at) VALUES (?, ?, ?, ?)');
      
      // Админ всегда активен (условно далеко в будущем)
      insert.run('admin', adminPass, 'admin', '2099-01-01 00:00:00');
      // Обычный юзер без подписки
      insert.run('user', userPass, 'user', null);
      console.log('[DB] Тестовые аккаунты созданы: admin/admin, user/user');
    }
  } catch (e) {
    console.error('[DB] Ошибка сидирования:', e);
  }
}

seedDatabase();

export default db;
