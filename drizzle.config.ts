
import { defineConfig } from 'drizzle-kit';

/**
 * Конфигурация Drizzle Kit для SQLite.
 */
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    // Drizzle Kit корректно понимает префикс file:
    url: process.env.DATABASE_URL || 'sqlite.db',
  },
  verbose: true,
  strict: true,
});
