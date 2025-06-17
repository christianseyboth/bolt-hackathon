'use i18n';
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ViewTransitions } from 'next-view-transitions';
import type { Viewport } from 'next';
import { LingoProvider, loadDictionary } from 'lingo.dev/react/rsc';

export const metadata: Metadata = {
    title: 'SecPilot - Advanced Email Security Software | AI-Powered Phishing & Malware Protection',
    description:
        "Protect your business from email attacks with SecPilot's AI-powered email security software. Detect phishing, malware, ransomware & business email compromise with 99.9% accuracy. Works with Gmail, Outlook & Office 365. Starting at $19/month. Free trial available.",
    keywords: [
        'email security software',
        'phishing protection',
        'malware detection',
        'ransomware prevention',
        'business email compromise',
        'AI email security',
        'email threat detection',
        'Gmail security',
        'Outlook security',
        'Office 365 security',
        'small business email protection',
        'enterprise email security',
        'email security for business',
        'cyber security email',
        'email filtering software',
    ],
    openGraph: {
        title: 'SecPilot - AI-Powered Email Security Software',
        description:
            'Advanced email threat protection for businesses. Detect phishing, malware & ransomware with 99.9% accuracy. Free trial available.',
        images: ['/banner.png'],
        type: 'website',
        url: 'https://secpilot.io',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SecPilot - AI-Powered Email Security Software',
        description:
            'Advanced email threat protection for businesses. Detect phishing, malware & ransomware with 99.9% accuracy.',
        images: ['/banner.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#06b6d4' },
        { media: '(prefers-color-scheme: dark)', color: '#06b6d4' },
    ],
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Locale handling temporarily disabled due to Lingo.dev compatibility issues
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'SecPilot',
        applicationCategory: 'SecurityApplication',
        operatingSystem: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
        description:
            'AI-powered email security software that detects phishing, malware, ransomware, and business email compromise attacks',
        offers: {
            '@type': 'Offer',
            price: '19',
            priceCurrency: 'USD',
            priceValidUntil: '2025-12-31',
            availability: 'https://schema.org/InStock',
        },
        provider: {
            '@type': 'Organization',
            name: 'SecPilot',
            url: 'https://secpilot.io',
        },
        screenshot: 'https://secpilot.io/hero-screenshot.avif',
        softwareVersion: '2.0',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1250',
        },
    };

    return (
        <LingoProvider loadDictionary={(locale) => loadDictionary(locale)}>
            <ViewTransitions>
                <html className='dark' style={{ position: 'relative' }}>
                    <head>
                        <script
                            type='application/ld+json'
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify(structuredData),
                            }}
                        />
                    </head>
                    <body
                        className={cn('bg-charcoal antialiased h-full w-full')}
                        style={{ position: 'relative' }}
                    >
                        {children}
                    </body>
                </html>
            </ViewTransitions>
        </LingoProvider>
    );
}
