import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
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
    domains: ['pollinations.ai', 'firebasestorage.googleapis.com', 'placehold.co'],
  },
  allowedDevOrigins: ['http://localhost:9002', 'http://192.168.1.84:9002'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:9002', '192.168.1.84:9002'],
    },
  },
};

export default nextConfig;
