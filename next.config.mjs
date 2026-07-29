/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Отключаем лишние функции для максимальной легкости статики
  trailingSlash: true,
};

export default nextConfig;
