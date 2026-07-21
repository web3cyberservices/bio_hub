import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'vpn.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

/**
 * Инициализация базы данных с актуальной схемой
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    expires_at DATETIME DEFAULT NULL,
    last_purchase_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    vpn_link TEXT
  )
`);

/**
 * Безопасная миграция для существующих баз данных
 */
function runMigrations() {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const columns = tableInfo.map(c => c.name.toLowerCase());
    
    // Добавляем столбцы по одному, если их нет
    if (!columns.includes('uid')) {
      db.exec("ALTER TABLE users ADD COLUMN uid TEXT");
    }
    if (!columns.includes('vpn_link')) {
      db.exec("ALTER TABLE users ADD COLUMN vpn_link TEXT");
    }
    if (!columns.includes('last_purchase_at')) {
      db.exec("ALTER TABLE users ADD COLUMN last_purchase_at DATETIME DEFAULT NULL");
    }
    if (!columns.includes('expires_at')) {
      db.exec("ALTER TABLE users ADD COLUMN expires_at DATETIME DEFAULT NULL");
    }

    // Создаем индексы отдельно, так как UNIQUE нельзя добавить в ALTER TABLE
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uid ON users(uid) WHERE uid IS NOT NULL");
    
    console.log('[DB] Migrations applied successfully');
  } catch (e) {
    console.error('[DB] Migration Error:', e);
  }
}

export async function saveUserToDb(data: { uid: string, username: string, vpn_link: string }) {
  // Используем username как первичный ключ для обновления, так как uid может еще не быть
  const stmt = db.prepare('UPDATE users SET uid = ?, vpn_link = ? WHERE username = ?');
  return stmt.run(data.uid, data.vpn_link, data.username);
}

runMigrations();

// Инициализация админа по умолчанию
const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (row.count === 0) {
  const adminPass = bcrypt.hashSync('admin', 10);
  db.prepare('INSERT INTO users (username, password, role, expires_at) VALUES (?, ?, ?, ?)')
    .run('admin', adminPass, 'admin', '2099-01-01T00:00:00.000Z');
}

export default db;
