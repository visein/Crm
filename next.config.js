/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for deployment
  output: 'standalone',
  
  // Turbopack configuration
  turbopack: {},
  
  // Build configuration  
  trailingSlash: false,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  }
}

module.exports = nextConfig