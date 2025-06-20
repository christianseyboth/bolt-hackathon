import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/providers/client-providers';

export const metadata: Metadata = {
    metadataBase: new URL('https://secpilot.com'),
    title: {
        default: 'SecPilot - Advanced Email Security Software | Phishing Protection',
        template: '%s | SecPilot',
    },
    description:
        "Protect your business from email threats with SecPilot's AI-powered security. Stop phishing, malware, and ransomware attacks with 99.9% accuracy.",
    keywords: [
        'email security',
        'phishing protection',
        'malware detection',
        'email threat protection',
        'AI email security',
        'cybersecurity software',
        'email gateway security',
        'business email protection',
        'anti-phishing software',
        'email filtering',
        'secure email',
        'threat intelligence',
        'email security solution',
        'enterprise email security',
    ],
    authors: [{ name: 'SecPilot Team' }],
    creator: 'SecPilot',
    publisher: 'SecPilot',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://secpilot.com',
        siteName: 'SecPilot',
        title: 'SecPilot - Advanced Email Security Software | Phishing Protection',
        description:
            "Protect your business from email threats with SecPilot's AI-powered security. Stop phishing, malware, and ransomware attacks with 99.9% accuracy.",
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'SecPilot - AI-Powered Email Security Software',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SecPilot - Advanced Email Security Software',
        description:
            'AI-powered email security that stops phishing, malware, and ransomware attacks with 99.9% accuracy.',
        images: ['/twitter-image.png'],
        creator: '@secpilot',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification-code',
        yahoo: 'your-yahoo-verification-code',
    },
    category: 'technology',
    classification: 'Business',
    other: {
        'geo.region': 'US',
        'geo.country': 'United States',
        'geo.placename': 'United States',
        ICBM: '39.0458, -76.6413', // Example coordinates for US East Coast
        'DC.title': 'SecPilot - Email Security Software',
        rating: 'general',
        distribution: 'global',
        'revisit-after': '7 days',
        language: 'en',
        target: 'all',
        audience: 'all',
        coverage: 'worldwide',
        subject: 'Email Security, Cybersecurity, Phishing Protection',
        copyright: 'SecPilot',
        'reply-to': 'contact@secpilot.com',
        owner: 'SecPilot',
        url: 'https://secpilot.com',
        'identifier-URL': 'https://secpilot.com',
        directory: 'submission',
        pagename: 'SecPilot - Email Security Software',
        'business-category': 'Business, Technology, Security',
        'geographic-coverage': 'Worldwide',
        'content-distribution': 'Global',
        'content-rating': 'General',
        'cache-control': '7 days',
        subtitle: 'AI-Powered Email Security Software',
        'target-audience':
            'Business owners, IT administrators, Security professionals, Freelancers, Small Business Owners, Startups, Entrepreneurs, and more.',
        HandheldFriendly: 'True',
        MobileOptimized: '320',
    },
};

type Props = {
    children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
    return (
        <html className='dark' lang='en' style={{ backgroundColor: 'black' }}>
            <head>
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1, maximum-scale=5'
                />
                <meta name='format-detection' content='telephone=no' />
                <link rel='canonical' href='https://secpilot.com' />
                <link rel='sitemap' type='application/xml' href='/sitemap.xml' />

                {/* Favicon - Multiple formats for maximum compatibility */}
                <link rel='icon' href='/favicon.ico' sizes='any' />
                <link rel='icon' href='/icon.svg' type='image/svg+xml' />
                <link rel='icon' href='/favicon-16x16.png' sizes='16x16' type='image/png' />
                <link rel='icon' href='/favicon-32x32.png' sizes='32x32' type='image/png' />
                <link rel='icon' href='/favicon-96x96.png' sizes='96x96' type='image/png' />

                {/* Apple Touch Icons */}
                <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
                <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />

                {/* Android Chrome Icons */}
                <link
                    rel='icon'
                    type='image/png'
                    sizes='192x192'
                    href='/android-chrome-192x192.png'
                />
                <link
                    rel='icon'
                    type='image/png'
                    sizes='512x512'
                    href='/android-chrome-512x512.png'
                />

                {/* PWA Manifest */}
                <link rel='manifest' href='/manifest.json' />
                <meta name='mobile-web-app-capable' content='yes' />
                <meta name='apple-mobile-web-app-capable' content='yes' />
                <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
                <meta name='apple-mobile-web-app-title' content='SecPilot' />
                <meta name='application-name' content='SecPilot' />
                <meta name='msapplication-TileColor' content='#10b981' />
                <meta name='msapplication-TileImage' content='/mstile-144x144.png' />
                <meta name='theme-color' content='#10b981' />

                {/* Structured Data for Organization */}
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'SecPilot',
                            url: 'https://secpilot.com',
                            logo: 'https://secpilot.com/logo.png',
                            description:
                                'Advanced email security software with AI-powered phishing protection',
                            address: {
                                '@type': 'PostalAddress',
                                addressLocality: 'United States',
                                addressCountry: 'US',
                            },
                            contactPoint: [
                                {
                                    '@type': 'ContactPoint',
                                    contactType: 'customer service',
                                    email: 'support@secpilot.com',
                                },
                                {
                                    '@type': 'ContactPoint',
                                    contactType: 'sales',
                                    email: 'sales@secpilot.com',
                                },
                            ],
                            sameAs: [
                                'https://twitter.com/secpilot',
                                'https://linkedin.com/company/secpilot',
                            ],
                        }),
                    }}
                />

                {/* Structured Data for Software Application */}
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'SoftwareApplication',
                            name: 'SecPilot',
                            applicationCategory: 'SecurityApplication',
                            operatingSystem: 'Web-based',
                            offers: {
                                '@type': 'Offer',
                                price: '9.90',
                                priceCurrency: 'USD',
                                priceSpecification: {
                                    '@type': 'UnitPriceSpecification',
                                    price: '9.90',
                                    priceCurrency: 'USD',
                                    unitCode: 'MON',
                                },
                            },
                            description:
                                'AI-powered email security software that protects businesses from phishing, malware, and ransomware attacks',
                            featureList: [
                                'AI-powered threat detection',
                                'Phishing protection',
                                'Malware detection',
                                'Real-time security analytics',
                                'Zero-storage privacy',
                            ],
                            screenshot: 'https://secpilot.com/screenshot.png',
                            softwareVersion: '1.0',
                            aggregateRating: {
                                '@type': 'AggregateRating',
                                ratingValue: '4.9',
                                ratingCount: '127',
                            },
                        }),
                    }}
                />
            </head>
            <body style={{ backgroundColor: 'black' }}>
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    );
}
