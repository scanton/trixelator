/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@trixelator/core']
};

module.exports = nextConfig;
