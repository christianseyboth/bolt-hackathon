import rehypePrism from '@mapbox/rehype-prism';
import nextMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import lingoCompiler from 'lingo.dev/compiler';

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
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
                pathname: '/**',
            },
        ],
    },
};
const withLingo = lingoCompiler.next({
    sourceLocale: 'en',
    targetLocales: ['es', 'fr', 'de'],
    useDirective: true,
    models: 'lingo.dev',
    sourceRoot: 'src', // Default for Next.js
    lingoDir: 'lingo', // Translation files directory
    debug: true, // Enable debug logging
});

export default withMDX(withLingo(nextConfig));
