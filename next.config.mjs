/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['image.tmdb.org'],
    formats: ['image/webp', 'image/avif'], // 优先使用现代图片格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // 响应式图片断点
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 图片尺寸选项
  },
  // 启用SWC压缩器
  swcMinify: true,
  // 压缩输出
  compress: true,
};

export default nextConfig;
