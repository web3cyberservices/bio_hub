
import { handlers } from "@/auth";

/**
 * В Auth.js v5 (NextAuth) роуты GET и POST экспортируются из объекта handlers.
 * Исправлена деструктуризация для устранения ошибки 'export not found'.
 */
export const GET = handlers.GET;
export const POST = handlers.POST;
