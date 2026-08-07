
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
    return { error: 'Ошибка валидации: минимум 8 символов' };
  }

  try {
    // Проверка существования пользователя
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();

    if (existingUser) {
      return { error: 'Тенант уже зарегистрирован' };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(users).values({
      email,
      passwordHash,
      role: 'enterprise_client',
      grpcQuota: 1000000,
    }).run();

    return { success: true };
  } catch (e: any) {
    console.error('Database error during registration:', e);
    return { error: `Ошибка инициализации БД: ${e.message || 'неизвестная ошибка'}` };
  }
}
