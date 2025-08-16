/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.universidadesargentinas.com.ar',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
