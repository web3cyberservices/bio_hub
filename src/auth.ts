import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'eq';
import bcrypt from 'bcryptjs';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

/**
 * Полная конфигурация для Node.js среды.
 */
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email),
          });
          
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              role: user.role,
              grpcQuota: user.grpcQuota,
            };
          }
        }
        return null;
      },
    }),
  ],
});