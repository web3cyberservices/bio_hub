/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Отключаем лишние заголовки для статики
  poweredByHeader: false,
};

export default nextConfig;
