
'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Инициализация нового тенанта в системе.
 * Выполняет хеширование пароля и создание записи в SQLite.
 */
export async function registerTenant(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = RegisterSchema.safeParse({ email, password });
  if (!result.success) {
    return { error: 'ОШИБКА ВАЛИДАЦИИ: МИНИМУМ 8 СИМВОЛОВ' };
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: 'ТЕНАНТ УЖЕ ЗАРЕГИСТРИРОВАН' };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      email,
      passwordHash,
      role: 'enterprise_client',
      grpcQuota: 1000000,
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'ОШИБКА ИНИЦИАЛИЗАЦИИ БД' };
  }
}
