
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// OPSEC: Использование внешнего или временного пути для БД, чтобы избежать записи в корень проекта
const dbPath = process.env.DATABASE_URL || '/tmp/sqlite.db';
const sqlite = new Database(dbPath);

sqlite.pragma('journal_mode = WAL');

// Инициализация базовых таблиц
sqlite.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'enterprise_client',
    grpc_quota INTEGER DEFAULT 1000000,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

export const db = drizzle(sqlite, { schema });
