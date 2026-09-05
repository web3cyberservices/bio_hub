
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { AdapterAccount } from 'next-auth/adapters';

/**
 * Расширенная схема БД для поддержки модулей ИБ.
 */

export const users = sqliteTable('user', {
  id: text('id').notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  passwordHash: text('password_hash'),
  role: text('role').default('enterprise_client'),
  grpcQuota: integer('grpc_quota').default(1000000),
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const accounts = sqliteTable('account', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccount['type']>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
});

export const verificationTokens = sqliteTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// Новая таблица для истории сканирований
export const securityScans = sqliteTable('security_scans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  target: text('target').notNull(),
  type: text('type').notNull(), // 'pentest', 'osint', etc.
  method: text('method').notNull(), // 'nuclei', 'spiderfoot', etc.
  status: text('status').default('in_progress'), // 'in_progress', 'completed', 'failed'
  resultSummary: text('result_summary'),
  reportPath: text('report_path'),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`),
});

export const telemetryLogs = sqliteTable('telemetry_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id').references(() => users.id),
  severity: text('severity').notNull(),
  protocol: text('protocol').notNull(),
  payload: text('payload'),
  latencyMs: integer('latency_ms'),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`),
});
