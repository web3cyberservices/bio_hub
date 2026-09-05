
import { handlers } from "@/auth";

/**
 * Стандартный экспорт обработчиков для NextAuth v5.
 * force-dynamic необходим, чтобы Next.js не пытался пре-рендерить этот эндпоинт при сборке.
 */
export const { GET, POST } = handlers;
export const dynamic = 'force-dynamic';
