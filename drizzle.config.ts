
import { defineConfig } from 'drizzle-kit';

/**
 * Конфигурация Drizzle Kit для SQLite (август 2026).
 */
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'sqlite.db',
  },
  verbose: true,
  strict: true,
});
