import {withSentryConfig} from '@sentry/nextjs';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

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

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "secpilot",
project: "secpilot",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
// tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});