import rehypePrism from '@mapbox/rehype-prism';
import nextMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';

const withMDX = nextMDX({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypePrism],
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
    experimental: {
        mdxRs: false,
    },
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
            {
                protocol: 'https',
                hostname: 'api.microlink.io',
                pathname: '/**',
            },
        ],
    },

    // Properly handle Motion/Framer Motion
    transpilePackages: ['motion'],

    webpack: (config, { isServer }) => {
        if (isServer) {
            // Handle Motion on server-side
            config.externals.push({
                'motion/react': 'motion/react',
                'framer-motion': 'framer-motion',
            });
        }

        // Handle Motion module resolution
        config.resolve.alias = {
            ...config.resolve.alias,
            'motion/react': require.resolve('motion/react'),
        };

        return config;
    },
};

export default withMDX(nextConfig);
