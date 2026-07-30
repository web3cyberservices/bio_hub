
'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerTenant(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = RegisterSchema.safeParse({ email, password });
  if (!result.success) {
    return { error: 'Некорректные данные' };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { error: 'Пользователь уже существует' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({
      email,
      passwordHash,
      role: 'enterprise_client',
      grpcQuota: 1000000,
    });
    return { success: true };
  } catch (e) {
    return { error: 'Ошибка базы данных' };
  }
}
