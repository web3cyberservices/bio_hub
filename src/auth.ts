
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET || 'default-secret-change-me-in-production-env',
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
          } catch (error) {
            console.error('[AUTH_INTERNAL_ERROR]:', error);
            return null;
          }
        }
        return null;
      },
    }),
  ],
});
