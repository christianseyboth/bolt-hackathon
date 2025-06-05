import rehypePrism from '@mapbox/rehype-prism';
import nextMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // MDX Configuration
    experimental: {
        mdxRs: false, // Disable the Rust-based MDX compiler
    },

    // File extensions Next.js should handle
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'mdx'],

    // Image configurations
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
                hostname: 'i.pravatar.cc',
                pathname: '/**',
            },
        ],
    },

    // Add ESLint configuration (optional but recommended)
    eslint: {
        // Directories to run ESLint on during production builds
        dirs: ['pages', 'components', 'lib', 'src', 'mdx'],
        // Don't run ESLint during builds if you want to handle it separately
        ignoreDuringBuilds: true,
    },
};

// MDX Configuration with plugins
const withMDX = nextMDX({
    extension: /\.mdx?$/, // Handle both .mdx and .md files
    options: {
        remarkPlugins: [remarkGfm], // GitHub Flavored Markdown support
        rehypePlugins: [rehypePrism], // Syntax highlighting
        // Add optional MDX configuration
        providerImportSource: '@mdx-js/react',
    },
});

// Export the configured Next.js setup
export default withMDX(nextConfig);
