
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Middleware импортирует только легкую версию конфига,
 * так как Edge Runtime не поддерживает SQLite.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
