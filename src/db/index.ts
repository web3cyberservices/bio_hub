
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

/**
 * Инициализация подключения к SQLite.
 * Включает обработку префикса 'file:' и преобразование в абсолютный путь
 * для предотвращения ошибок в PM2 и при сборке Next.js.
 */

let dbPath = process.env.DATABASE_URL || 'sqlite.db';

// Удаляем префикс 'file:', если он передан (часто встречается в DATABASE_URL)
if (dbPath.startsWith('file:')) {
  dbPath = dbPath.replace(/^file:/, '');
}

// Превращаем путь в абсолютный относительно корня проекта, если он относительный
if (!path.isAbsolute(dbPath)) {
  dbPath = path.resolve(process.cwd(), dbPath);
}

const sqlite = new Database(dbPath, {
  // Полезно для отладки в логах PM2
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Оптимизация производительности для SQLite
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');

export const db = drizzle(sqlite, { schema });
