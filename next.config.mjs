/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
    ],
  },
  // Enable source maps for debugging
  webpack: (config, { dev, isServer }) => {
    if (dev && isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },
};

export default nextConfig;
