import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'vpn.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

/**
 * Инициализация базовой структуры
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/**
 * Принудительная миграция колонок
 */
function runMigrations() {
  console.log('[DB] Запуск миграций...');
  try {
    const tableInfo = db.prepare('PRAGMA table_info(users)').all() as any[];
    const columns = tableInfo.map(c => c.name.toLowerCase());
    
    // Добавляем колонки по одной, если их нет
    if (!columns.includes('uid')) {
      console.log('[DB] Добавление колонки uid');
      db.exec('ALTER TABLE users ADD COLUMN uid TEXT');
      db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uid ON users(uid) WHERE uid IS NOT NULL');
    }
    
    if (!columns.includes('vpn_link')) {
      console.log('[DB] Добавление колонки vpn_link');
      db.exec('ALTER TABLE users ADD COLUMN vpn_link TEXT');
    }
    
    if (!columns.includes('expires_at')) {
      console.log('[DB] Добавление колонки expires_at');
      db.exec('ALTER TABLE users ADD COLUMN expires_at DATETIME DEFAULT NULL');
    }
    
    if (!columns.includes('last_purchase_at')) {
      console.log('[DB] Добавление колонки last_purchase_at');
      db.exec('ALTER TABLE users ADD COLUMN last_purchase_at DATETIME DEFAULT NULL');
    }

    console.log('[DB] Миграции завершены успешно');
  } catch (e) {
    console.error('[DB] Ошибка миграции:', e);
  }
}

runMigrations();

// Инициализация админа
try {
  const adminRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin') as { count: number };
  if (adminRow && adminRow.count === 0) {
    const adminPass = bcrypt.hashSync('admin', 10);
    db.prepare("INSERT INTO users (username, password, role, expires_at) VALUES (?, ?, 'admin', '2099-01-01T00:00:00.000Z')")
      .run('admin', adminPass);
    console.log('[DB] Дефолтный админ создан');
  }
} catch (e) {
  console.error('[DB] Ошибка при проверке админа:', e);
}

export async function saveUserToDb(data: { uid: string, username: string, vpn_link: string }) {
  const stmt = db.prepare('UPDATE users SET uid = ?, vpn_link = ? WHERE username = ?');
  return stmt.run(data.uid, data.vpn_link, data.username);
}

export default db;
