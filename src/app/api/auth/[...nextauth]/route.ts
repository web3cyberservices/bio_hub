
import { handlers } from "@/auth";

/**
 * Стандартный экспорт обработчиков для NextAuth v5 (Beta 25+).
 * Использование деструктуризации напрямую из handlers.
 */
export const { GET, POST } = handlers;
