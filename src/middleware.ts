
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Импортируем auth только из Edge-совместимого конфига
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
