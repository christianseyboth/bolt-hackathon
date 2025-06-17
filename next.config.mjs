import rehypePrism from '@mapbox/rehype-prism';
import nextMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import lingoCompiler from 'lingo.dev/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // MDX Configuration
    experimental: {
        mdxRs: true, // Disable the Rust-based MDX compiler
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

    // Add ESLint configuration
    eslint: {
        // Directories to run ESLint on during production builds
        dirs: ['pages', 'components', 'lib', 'src', 'mdx'],
        // Allow warnings but not errors
        ignoreDuringBuilds: false,
    },

    // TypeScript configuration
    typescript: {
        ignoreBuildErrors: false,
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

const withLingo = lingoCompiler.next({
    sourceLocale: 'en',
    targetLocales: ['es', 'fr', 'de'],
    sourceRoot: './src',
    rsc: false, // Disable React Server Components support (default: false)
    debug: true, // Enable debug mode for troubleshooting
    models: 'lingo.dev',
    useDirective: true, // Enable "use i18n" directive for file-by-file control
});

// Export the configured Next.js setup
export default withMDX(withLingo(nextConfig));
