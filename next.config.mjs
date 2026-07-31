/** @type {import('next').NextConfig} */
const nextConfig = {
  // Конфигурация для работы серверных компонентов и сессий
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuildErrors: true,
  },
};

export default nextConfig;