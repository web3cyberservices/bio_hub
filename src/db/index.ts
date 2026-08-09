import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'sqlite.db');
const sqlite = new Database(dbPath);

// Устанавливаем WAL режим для производительности в конкурентной среде
sqlite.pragma('journal_mode = WAL');

// Ручное создание таблицы пользователей при инициализации, 
// если она еще не создана механизмом миграций.
sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'enterprise_client',
    grpc_quota INTEGER DEFAULT 1000000,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

export const db = drizzle(sqlite, { schema });
