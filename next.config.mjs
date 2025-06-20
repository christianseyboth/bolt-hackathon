/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

    // Performance optimizations
    compress: true,
    poweredByHeader: false,

    // Bundle optimization
    webpack: (config, { dev, isServer }) => {
        // Enable better bundle splitting for production
        if (!dev && !isServer) {
            config.optimization.splitChunks.cacheGroups = {
                ...config.optimization.splitChunks.cacheGroups,
                motion: {
                    name: 'motion',
                    test: /[\\/]node_modules[\\/]motion[\\/]/,
                    chunks: 'all',
                    priority: 10,
                },
                icons: {
                    name: 'icons',
                    test: /[\\/]node_modules[\\/](@tabler\/icons-react|react-icons|lucide-react)[\\/]/,
                    chunks: 'all',
                    priority: 9,
                },
                particles: {
                    name: 'particles',
                    test: /[\\/]node_modules[\\/]@tsparticles[\\/]/,
                    chunks: 'all',
                    priority: 8,
                },
                radix: {
                    name: 'radix',
                    test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                    chunks: 'all',
                    priority: 7,
                },
            };
        }
        return config;
    },

    images: {
        // Enable modern image formats and optimization
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 31536000, // 1 year cache
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'api.microlink.io',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
                pathname: '/**',
            },
        ],
    },

    // Experimental features for performance
    experimental: {
        optimizePackageImports: ['@tabler/icons-react', 'lucide-react', 'react-icons'],
    },
};

export default nextConfig;
