
import { defineConfig } from 'drizzle-kit';

/**
 * Конфигурация Drizzle Kit.
 * Путь к БД изменен на абсолютный для исключения ошибок в PM2/Nginx.
 */
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'sqlite.db',
  },
  verbose: true,
  strict: true,
});
