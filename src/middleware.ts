import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Используем только легкий конфиг для Edge Runtime.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};