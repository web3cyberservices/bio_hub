
'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { signOut as nextSignOut } from '@/auth';

/**
 * Серверные экшены для управления сессиями и регистрацией.
 */

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
    // Проверка существования пользователя через get() для производительности SQLite
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    
    if (existingUser) {
      return { error: 'Тенант уже зарегистрирован в системе' };
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
    console.error('Registration failed:', e);
    return { error: 'Системная ошибка при создании тенанта' };
  }
}

export async function handleSignOut() {
  try {
    await nextSignOut({ redirectTo: '/' });
  } catch (error) {
    // В Next.js 15 signOut может бросать ошибку редиректа, это нормально
    if ((error as any).digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Sign out error:', error);
  }
}
