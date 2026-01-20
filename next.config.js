/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  webpack: (config) => {
    // Exclude supabase functions from webpack compilation
    config.module.rules.push({
      test: /supabase\/functions\/.*\.ts$/,
      use: {
        loader: 'ignore-loader',
      },
    })
    return config
  },
}

module.exports = nextConfig
