
'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { signOut as nextSignOut } from '@/auth';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerTenant(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = RegisterSchema.safeParse({ email, password });
  if (!result.success) {
    return { error: 'Ошибка валидации: минимум 8 символов' };
  }

  try {
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
    return { error: `Ошибка БД: ${e.message}` };
  }
}

export async function handleSignOut() {
  await nextSignOut({ redirectTo: '/' });
}
