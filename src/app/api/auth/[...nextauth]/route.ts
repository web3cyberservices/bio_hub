import { handlers } from "@/auth";

/**
 * В Auth.js v5 (NextAuth) роуты GET и POST экспортируются из объекта handlers.
 * Это исправляет ошибку 'export not found'.
 */
export const { GET, POST } = handlers;
