import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'vpn.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

/**
 * Инициализация базы данных с базовой схемой
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
 * Безопасная миграция для добавления отсутствующих колонок
 */
function runMigrations() {
  console.log('[DB] Running migrations...');
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const columns = tableInfo.map(c => c.name.toLowerCase());
    
    const columnsToAdd = [
      { name: 'uid', type: 'TEXT' },
      { name: 'vpn_link', type: 'TEXT' },
      { name: 'expires_at', type: 'DATETIME DEFAULT NULL' },
      { name: 'last_purchase_at', type: 'DATETIME DEFAULT NULL' }
    ];

    for (const col of columnsToAdd) {
      if (!columns.includes(col.name.toLowerCase())) {
        console.log(`[DB] Adding column: ${col.name}`);
        db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    // Создаем индексы отдельно (UNIQUE нельзя добавить в ALTER TABLE напрямую в SQLite)
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uid ON users(uid) WHERE uid IS NOT NULL");
    
    console.log('[DB] All migrations applied successfully');
  } catch (e) {
    console.error('[DB] Migration Error:', e);
  }
}

runMigrations();

// Инициализация админа по умолчанию
const adminRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('admin') as { count: number };
if (adminRow.count === 0) {
  const adminPass = bcrypt.hashSync('admin', 10);
  db.prepare('INSERT INTO users (username, password, role, expires_at) VALUES (?, ?, ?, ?)')
    .run('admin', adminPass, 'admin', '2099-01-01T00:00:00.000Z');
  console.log('[DB] Default admin created');
}

export async function saveUserToDb(data: { uid: string, username: string, vpn_link: string }) {
  const stmt = db.prepare('UPDATE users SET uid = ?, vpn_link = ? WHERE username = ?');
  return stmt.run(data.uid, data.vpn_link, data.username);
}

export default db;
