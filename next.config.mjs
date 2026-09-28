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
    ];
  },
};

export default nextConfig
