import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

/**
 * Инициализация SQLite базы данных с автоматическим созданием схем.
 */
const sqlite = new Database('sqlite.db');

// Автоматическая инициализация таблиц для предотвращения ошибок "no such table"
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'enterprise_client',
    grpc_quota INTEGER DEFAULT 1000000,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export const db = drizzle(sqlite, { schema });
