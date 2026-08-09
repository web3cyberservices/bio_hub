import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Используем authConfig напрямую для Middleware, чтобы избежать
 * загрузки Node-специфичных библиотек (SQLite) в Edge Runtime.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
