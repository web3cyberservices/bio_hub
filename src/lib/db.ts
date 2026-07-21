import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'vpn.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 1. Создаем базовую таблицу, если её нет
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

// 2. Робастная миграция для добавления новых колонок
function runMigrations() {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const columns = tableInfo.map(c => c.name.toLowerCase());
    
    if (!columns.includes('last_purchase_at')) {
      console.log('[DB] Добавление колонки last_purchase_at...');
      db.exec("ALTER TABLE users ADD COLUMN last_purchase_at DATETIME DEFAULT NULL");
    }
    
    if (!columns.includes('created_at')) {
      console.log('[DB] Добавление колонки created_at...');
      db.exec("ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
    }
  } catch (e) {
    console.error('[DB] Ошибка миграции:', e);
  }
}

function seedDatabase() {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    if (row.count === 0) {
      console.log('[DB] Инициализация системы...');
      const adminPass = bcrypt.hashSync('admin', 10);
      const userPass = bcrypt.hashSync('user', 10);

      const insert = db.prepare('INSERT INTO users (username, password, role, expires_at) VALUES (?, ?, ?, ?)');
      
      // Единственный админ
      insert.run('admin', adminPass, 'admin', '2099-01-01 00:00:00');
      // Тестовый пользователь
      insert.run('user', userPass, 'user', null);
      
      console.log('[DB] База готова. Доступ: admin/admin, user/user');
    }
  } catch (e) {
    console.error('[DB] Ошибка сидирования:', e);
  }
}

runMigrations();
seedDatabase();

export default db;