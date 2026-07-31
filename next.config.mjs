
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 
   * Мы отключаем 'output: export', так как проект использует:
   * 1. NextAuth.js (работа с куки и заголовками)
   * 2. Server Actions (регистрация и работа с БД)
   * 3. Better-SQLite3 (нативный Node.js модуль)
   */
  reactStrictMode: true,
  // В серверной среде (PM2/Node) Next.js автоматически работает в режиме SSR/ISR.
};

export default nextConfig;
