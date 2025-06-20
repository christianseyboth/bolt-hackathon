import { CTA } from '@/components/marketing/cta';
import { FAQs } from '@/components/marketing/faqs';
import { Features } from '@/components/features';
import { Hero } from '@/components/marketing/hero';
import { Tools } from '@/components/marketing/tools';
import { NavBar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { Metadata } from 'next';
import { LazyTestimonialsSlider, LazyBackgroundEffects } from '@/components/LazyComponents';
import { ElevenLabsWidget } from '@/components/ElevenLabsWidget';

export const metadata: Metadata = {
    title: 'SecPilot - Advanced Email Security Software | AI-Powered Phishing Protection',
    description:
        "Protect your business from email threats with SecPilot's AI-powered security platform. Stop phishing, malware, and ransomware attacks with 99.9% accuracy. Trusted by security professionals worldwide.",
    keywords: [
        'email security software',
        'AI phishing protection',
        'email threat detection',
        'malware protection',
        'cybersecurity solution',
        'business email security',
        'anti-phishing software',
        'email gateway security',
        'threat intelligence',
        'zero-trust email security',
    ],
    openGraph: {
        title: 'SecPilot - AI-Powered Email Security Software',
        description:
            'Advanced email security that stops phishing, malware, and ransomware attacks with 99.9% accuracy.',
        type: 'website',
        url: 'https://secpilot.com',
        images: [
            {
                url: '/og-homepage.png',
                width: 1200,
                height: 630,
                alt: 'SecPilot - AI-Powered Email Security Software Dashboard',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SecPilot - AI-Powered Email Security Software',
        description:
            'Stop email threats with 99.9% accuracy. Advanced AI-powered protection against phishing, malware, and ransomware.',
        images: ['/twitter-homepage.png'],
    },
    alternates: {
        canonical: 'https://secpilot.com',
    },
};

// Lazy load the Testimonials component since it's below the fold
const LazyTestimonials = () => (
    <section aria-label='Customer testimonials'>
        <LazyTestimonialsSlider />
    </section>
);

export default function Home() {
    return (
        <>
            {/* Enhanced Structured Data for Homepage */}
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: 'SecPilot',
                        url: 'https://secpilot.com',
                        description:
                            'AI-powered email security software that protects businesses from phishing, malware, and ransomware attacks',
                        potentialAction: {
                            '@type': 'SearchAction',
                            target: 'https://secpilot.com/search?q={search_term_string}',
                            'query-input': 'required name=search_term_string',
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'SecPilot',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://secpilot.com/logo.png',
                            },
                        },
                    }),
                }}
            />

            {/* Product/Service Structured Data */}
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: 'SecPilot Email Security Software',
                        description:
                            'AI-powered email security software that protects businesses from phishing, malware, and ransomware attacks with 99.9% accuracy',
                        brand: {
                            '@type': 'Brand',
                            name: 'SecPilot',
                        },
                        category: 'Security Software',
                        offers: {
                            '@type': 'Offer',
                            price: '9.90',
                            priceCurrency: 'USD',
                            availability: 'https://schema.org/InStock',
                            url: 'https://secpilot.com/pricing',
                            priceSpecification: {
                                '@type': 'UnitPriceSpecification',
                                price: '9.90',
                                priceCurrency: 'USD',
                                unitCode: 'MON',
                                unitText: 'per month',
                            },
                        },
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: '4.9',
                            reviewCount: '127',
                            bestRating: '5',
                            worstRating: '1',
                        },
                        review: [
                            {
                                '@type': 'Review',
                                reviewRating: {
                                    '@type': 'Rating',
                                    ratingValue: '5',
                                    bestRating: '5',
                                },
                                author: {
                                    '@type': 'Person',
                                    name: 'Security Professional',
                                },
                                reviewBody:
                                    'SecPilot has dramatically improved our email security posture. The AI-powered detection catches threats that other solutions miss.',
                            },
                        ],
                        applicationCategory: 'SecurityApplication',
                        operatingSystem: 'Web-based, Cloud',
                        features: [
                            'AI-powered threat detection',
                            'Real-time phishing protection',
                            'Malware scanning and removal',
                            'Zero-storage privacy model',
                            'Advanced threat analytics',
                            'Integration with popular email platforms',
                        ],
                    }),
                }}
            />

            {/* FAQ Structured Data */}
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'What is SecPilot?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'SecPilot is an AI-powered email security software that protects businesses from phishing, malware, and ransomware attacks with 99.9% accuracy. It provides real-time threat detection and advanced security analytics.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'How does SecPilot protect against phishing?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'SecPilot uses advanced AI algorithms to analyze email content, sender reputation, and behavioral patterns to identify and block phishing attempts in real-time before they reach your inbox.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Is SecPilot suitable for small businesses?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Yes, SecPilot offers flexible plans starting at $9.90/month, making enterprise-grade email security accessible to businesses of all sizes, from individual professionals to large enterprises.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Does SecPilot store my emails?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'No, SecPilot follows a zero-storage privacy model. We analyze emails in real-time for threats but do not store or retain your email content, ensuring complete privacy and compliance.',
                                },
                            },
                        ],
                    }),
                }}
            />

            {/* Breadcrumb Structured Data */}
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Home',
                                item: 'https://secpilot.com',
                            },
                        ],
                    }),
                }}
            />

            {/* Organization Structured Data */}
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: 'SecPilot',
                        alternateName: 'SecPilot Email Security',
                        url: 'https://secpilot.com',
                        logo: 'https://secpilot.com/logo.png',
                        description:
                            'AI-powered email security software that protects businesses from phishing, malware, and ransomware attacks',
                        foundingDate: '2024',
                        founders: [
                            {
                                '@type': 'Person',
                                name: 'SecPilot Team',
                            },
                        ],
                        contactPoint: {
                            '@type': 'ContactPoint',
                            telephone: '+1-555-123-4567',
                            contactType: 'customer service',
                            email: 'support@secpilot.com',
                            availableLanguage: ['English'],
                        },
                        sameAs: [
                            'https://twitter.com/secpilot',
                            'https://linkedin.com/company/secpilot',
                            'https://github.com/secpilot',
                        ],
                        address: {
                            '@type': 'PostalAddress',
                            streetAddress: '123 Security Street',
                            addressLocality: 'San Francisco',
                            addressRegion: 'CA',
                            postalCode: '94102',
                            addressCountry: 'US',
                        },
                    }),
                }}
            />

            <NavBar />
            <main className='bg-black text-white overflow-hidden'>
                <LazyBackgroundEffects />
                <div className='relative z-10'>
                    <header>
                        <Hero />
                    </header>

                    <section aria-label='Email security features'>
                        <Features />
                    </section>

                    <section aria-label='SecPilot platform overview'>
                        <Tools />
                    </section>

                    <LazyTestimonials />

                    <section aria-label='Frequently asked questions'>
                        <FAQs />
                    </section>

                    <section aria-label='Get started with SecPilot'>
                        <CTA />
                    </section>
                </div>
            </main>
            <Footer />
            <Toaster />

            {/* ElevenLabs ConvAI Widget */}
            <ElevenLabsWidget agentId='agent_01jvw1s8axewkvfpz9grfdzrtz' />
        </>
    );
}
