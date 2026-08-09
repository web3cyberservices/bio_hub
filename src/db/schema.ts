
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('enterprise_client'),
  grpcQuota: integer('grpc_quota').default(1000000),
  status: text('status').default('active'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
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
