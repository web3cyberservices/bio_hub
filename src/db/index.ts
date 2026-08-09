import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// OPSEC: Безопасный путь к базе данных
const dbPath = process.env.DATABASE_URL || '/tmp/cyber_services.sqlite';
const sqlite = new Database(dbPath);

sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });