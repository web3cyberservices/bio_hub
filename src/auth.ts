
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Конфигурация Auth.js v5.
 * Включен debug для логирования ошибок на сервере.
 * trustHost: true необходим для работы за Nginx.
 */
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET || 'secret-at-least-32-chars-long-for-production',
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          try {
            const user = await db.query.users.findFirst({
              where: eq(users.email, email),
            });
            
            if (!user) {
              console.log('[AUTH] Пользователь не найден:', email);
              return null;
            }
            
            const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
            
            if (passwordsMatch) {
              return {
                id: user.id,
                email: user.email,
                role: user.role,
                grpcQuota: user.grpcQuota,
              };
            } else {
              console.log('[AUTH] Неверный пароль для:', email);
            }
          } catch (error) {
            console.error('[AUTH] Ошибка при проверке в БД:', error);
            return null;
          }
        }

        return null;
      },
    }),
  ],
});
