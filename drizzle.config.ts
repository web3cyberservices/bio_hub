import { defineConfig } from 'drizzle-kit';

/**
 * Конфигурация Drizzle Kit для SQLite.
 * Исправлена для совместимости с последними версиями drizzle-kit.
 */
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'sqlite.db',
  },
});
