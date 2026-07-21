import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

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
    expires_at DATETIME DEFAULT NULL,
    last_purchase_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Миграция: Проверяем наличие новых колонок в существующей базе
try {
  const columns = db.prepare("PRAGMA table_info(users)").all() as any[];
  const columnNames = columns.map(c => c.name);
  
  if (!columnNames.includes('last_purchase_at')) {
    db.exec("ALTER TABLE users ADD COLUMN last_purchase_at DATETIME DEFAULT NULL");
    console.log('[DB] Добавлена колонка last_purchase_at');
  }
  if (!columnNames.includes('created_at')) {
    db.exec("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
    console.log('[DB] Добавлена колонка created_at');
  }
} catch (e) {
  console.error('[DB] Ошибка миграции:', e);
}

function seedDatabase() {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    if (row.count === 0) {
      console.log('[DB] Инициализация системы...');
      const adminPass = bcrypt.hashSync('admin', 10);
      const userPass = bcrypt.hashSync('user', 10);

      const insert = db.prepare('INSERT INTO users (username, password, role, expires_at) VALUES (?, ?, ?, ?)');
      
      // Единственный админ - логин 'admin'
      insert.run('admin', adminPass, 'admin', '2099-01-01 00:00:00');
      // Тестовый обычный пользователь
      insert.run('user', userPass, 'user', null);
      
      console.log('[DB] База готова. Доступ: admin/admin, user/user');
    }
  } catch (e) {
    console.error('[DB] Ошибка сидирования:', e);
  }
}

seedDatabase();

export default db;
