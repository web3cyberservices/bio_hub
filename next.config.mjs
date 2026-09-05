
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Игнорируем ошибки линтера при сборке, так как мы используем строгий CI
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Игнорируем ошибки типизации при сборке для ускорения процесса на сервере
    ignoreBuildErrors: true,
  },
  // Настройка для работы за Nginx прокси
  poweredByHeader: false,
};

export default nextConfig;
