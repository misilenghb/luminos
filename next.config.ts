import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // 临时禁用严格模式来避免双重渲染
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pollinations.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['pollinations.ai', 'image.pollinations.ai', 'firebasestorage.googleapis.com', 'placehold.co'],
  },
  allowedDevOrigins: ['http://localhost:9002', 'http://192.168.1.84:9002'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:9002', '192.168.1.84:9002'],
      bodySizeLimit: '2mb',
    },
  },
  // 使用新的 turbopack 配置替代已弃用的 experimental.turbo
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // 添加开发模式配置
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any) => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      // 禁用一些可能导致 Server Action 问题的功能
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            serverActions: false, // 禁用 Server Actions 的代码分割
          },
        },
      };
      return config;
    },
  }),
};

export default nextConfig;
