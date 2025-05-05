/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
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
  },
  
  // API rewrites to proxy requests to the backend
  async rewrites() {
    // Use environment variable for API URL, falling back to localhost for development
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Only apply rewrites in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5001/api/:path*' // Proxy to backend in development
        }
      ];
    }
    
    // In production, don't rewrite API calls - let them go directly to the backend URL
    return [];
  }
}

module.exports = nextConfig
