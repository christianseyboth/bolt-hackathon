import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://secpilot.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/contact', '/about', '/privacy', '/terms', '/gdpr', '/security-policy'],
        disallow: [
          '/dashboard/*',
          '/auth/*',
          '/login',
          '/register',
          '/reset-password',
          '/setup-account',
          '/api/*',
          '/_next/*',
          '/account/*',
          '/api-keys/*',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/pricing', '/contact', '/about', '/privacy', '/terms', '/gdpr', '/security-policy'],
        disallow: [
          '/dashboard/*',
          '/auth/*',
          '/login',
          '/register',
          '/reset-password',
          '/setup-account',
          '/api/*',
          '/_next/*',
          '/account/*',
          '/api-keys/*',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/pricing', '/contact', '/about', '/privacy', '/terms', '/gdpr', '/security-policy'],
        disallow: [
          '/dashboard/*',
          '/auth/*',
          '/login',
          '/register',
          '/reset-password',
          '/setup-account',
          '/api/*',
          '/_next/*',
          '/account/*',
          '/api-keys/*',
        ],
      },
      {
        userAgent: 'CCBot',
        allow: ['/', '/pricing', '/contact', '/about', '/privacy', '/terms', '/gdpr', '/security-policy'],
        disallow: [
          '/dashboard/*',
          '/auth/*',
          '/login',
          '/register',
          '/reset-password',
          '/setup-account',
          '/api/*',
          '/_next/*',
          '/account/*',
          '/api-keys/*',
        ],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/pricing', '/contact', '/about', '/privacy', '/terms', '/gdpr', '/security-policy'],
        disallow: [
          '/dashboard/*',
          '/auth/*',
          '/login',
          '/register',
          '/reset-password',
          '/setup-account',
          '/api/*',
          '/_next/*',
          '/account/*',
          '/api-keys/*',
        ],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/pricing', '/contact', '/about', '/privacy', '/terms', '/gdpr', '/security-policy'],
        disallow: [
          '/dashboard/*',
          '/auth/*',
          '/login',
          '/register',
          '/reset-password',
          '/setup-account',
          '/api/*',
          '/_next/*',
          '/account/*',
          '/api-keys/*',
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
