
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Middleware для защиты маршрутов. 
 * Использует облегченную конфигурацию без зависимостей от БД.
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Защищаем роуты, требующие авторизации
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
