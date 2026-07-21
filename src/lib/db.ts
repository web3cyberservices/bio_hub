
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Файл базы данных будет лежать в корне проекта под именем vpn.db
const dbPath = path.resolve(process.cwd(), 'vpn.db');
const db = new Database(dbPath);

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

// Сидирование начальных данных (admin/user), если база пуста
const seedUsers = () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    const salt = 10;
    const adminPass = bcrypt.hashSync('admin', salt);
    const userPass = bcrypt.hashSync('user', salt);

    const insert = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
    insert.run('admin', adminPass, 'admin');
    insert.run('user', userPass, 'user');
    
    console.log('Database seeded with default accounts: admin/admin, user/user');
  }
};

seedUsers();

export default db;
