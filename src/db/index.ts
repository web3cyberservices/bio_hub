
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

/**
 * Инициализация SQLite базы данных.
 * Используется абсолютный путь для стабильности на сервере.
 */
const dbPath = path.join(process.cwd(), 'sqlite.db');
const sqlite = new Database(dbPath);

// Принудительное создание таблицы при запуске, если она отсутствует
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
