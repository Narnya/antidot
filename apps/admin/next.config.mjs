/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship TypeScript source; Next must transpile them.
  transpilePackages: [
    '@social-events/ui',
    '@social-events/types',
    '@social-events/validators',
    '@social-events/config',
    '@social-events/analytics',
  ],
};

export default nextConfig;
