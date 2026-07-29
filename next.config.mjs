
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Отключаем серверные фичи для максимальной производительности статики
  trailingSlash: true,
};

export default nextConfig;
