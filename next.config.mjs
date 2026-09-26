/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use standalone in container/docker environments, default on Vercel
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
};

export default nextConfig;
