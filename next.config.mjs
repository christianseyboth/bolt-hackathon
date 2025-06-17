/** @type {import('next').NextConfig} */
const nextConfig = {
    // Minimal configuration
    experimental: {
        // Remove all experimental features for now
    },

    // Basic image configuration
    images: {
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
        ],
    },

    // Disable problematic features
    eslint: {
        ignoreDuringBuilds: true, // Temporarily ignore ESLint
    },

    typescript: {
        ignoreBuildErrors: true, // Temporarily ignore TypeScript errors
    },
};

export default nextConfig;
