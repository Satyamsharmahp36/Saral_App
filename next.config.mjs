/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enables static site export
  webpack: (config, { isServer }) => {
    // Disable error overlay
    config.devtool = false;
    return config;
  },
};

export default nextConfig;
