/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Use static HTML export instead of serverless functions
  output: 'export',
  
  // Remove serverless target as it's not needed with static export
  // target: 'serverless',
  
  // Configure image domains for external images
  images: {
    domains: [
      'example.com', // Add your actual image domains here
      'images.unsplash.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // Required for static export
  },
  
  // API rewrites to proxy requests to the backend
  async rewrites() {
    // Don't use rewrites with static export
    return [];
  }
}

module.exports = nextConfig
