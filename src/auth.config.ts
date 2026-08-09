
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

/**
 * Edge-compatible конфигурация NextAuth.
 * Не содержит зависимостей от БД (SQLite), что позволяет использовать её в Middleware.
 */
export const authConfig = {
  pages: {
    signIn: '/portal',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.grpcQuota = (user as any).grpcQuota;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).grpcQuota = token.grpcQuota;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        // Логика авторизации будет расширена в auth.ts, где доступна БД
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
