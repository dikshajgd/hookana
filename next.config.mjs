/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/statics',
        destination: '/portfolio/statics',
      },
      {
        source: '/videos',
        destination: '/portfolio/videos',
      },
      {
        source: '/ai',
        destination: '/portfolio/ai',
      },
    ];
  },
};

export default nextConfig
