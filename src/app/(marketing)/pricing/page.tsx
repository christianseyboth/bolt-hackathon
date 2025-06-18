import { FeatureIconContainer } from '@/components/features/feature-icon-container';
import { Heading } from '@/components/heading';
import { Subheading } from '@/components/subheading';
import { Container } from '@/components/container';
import { IconReceiptFilled } from '@tabler/icons-react';
import { Metadata } from 'next';
import { PricingSection } from '@/components/marketing/pricing-section';

export const metadata: Metadata = {
    title: 'Email Security Pricing Plans | SecPilot Transparent Pricing',
    description:
        'Simple, transparent pricing for SecPilot email security software. Plans starting at $9.90/month for small businesses. Advanced AI-powered phishing protection, malware detection, and real-time threat analytics with no hidden fees.',
    keywords: [
        'email security pricing',
        'cybersecurity software pricing',
        'phishing protection cost',
        'email security plans',
        'business email security pricing',
        'affordable email security',
        'enterprise email protection pricing',
        'AI email security cost',
    ],
    openGraph: {
        title: 'SecPilot Email Security Pricing | Simple & Transparent Plans',
        description:
            'Affordable email security plans starting at $9.90/month. AI-powered phishing protection for businesses of all sizes.',
        type: 'website',
        url: 'https://secpilot.com/pricing',
        images: ['/og-pricing.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SecPilot Pricing | Email Security Plans from $9.90/month',
        description:
            'Transparent pricing for enterprise-grade email security. No hidden fees, no setup costs.',
        images: ['/twitter-pricing.png'],
    },
    alternates: {
        canonical: 'https://secpilot.com/pricing',
    },
};

export default function PricingPage() {
    return (
        <>
            {/* Pricing Structured Data */}
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Service',
                        name: 'SecPilot Email Security Service',
                        description: 'AI-powered email security software with transparent pricing',
                        provider: {
                            '@type': 'Organization',
                            name: 'SecPilot',
                            url: 'https://secpilot.com',
                        },
                        offers: [
                            {
                                '@type': 'Offer',
                                name: 'Starter Plan',
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
                                description: 'Perfect for individual professionals and small teams',
                                itemOffered: {
                                    '@type': 'Service',
                                    name: 'Email Security Protection',
                                    description: 'AI-powered email threat detection and protection',
                                },
                            },
                            {
                                '@type': 'Offer',
                                name: 'Professional Plan',
                                price: '29.90',
                                priceCurrency: 'USD',
                                availability: 'https://schema.org/InStock',
                                url: 'https://secpilot.com/pricing',
                                priceSpecification: {
                                    '@type': 'UnitPriceSpecification',
                                    price: '29.90',
                                    priceCurrency: 'USD',
                                    unitCode: 'MON',
                                    unitText: 'per month',
                                },
                                description: 'Advanced features for growing businesses',
                                itemOffered: {
                                    '@type': 'Service',
                                    name: 'Advanced Email Security',
                                    description:
                                        'Enhanced protection with advanced analytics and reporting',
                                },
                            },
                            {
                                '@type': 'Offer',
                                name: 'Enterprise Plan',
                                price: '99.90',
                                priceCurrency: 'USD',
                                availability: 'https://schema.org/InStock',
                                url: 'https://secpilot.com/pricing',
                                priceSpecification: {
                                    '@type': 'UnitPriceSpecification',
                                    price: '99.90',
                                    priceCurrency: 'USD',
                                    unitCode: 'MON',
                                    unitText: 'per month',
                                },
                                description: 'Complete enterprise-grade email security solution',
                                itemOffered: {
                                    '@type': 'Service',
                                    name: 'Enterprise Email Security',
                                    description:
                                        'Full-featured security suite with priority support',
                                },
                            },
                        ],
                    }),
                }}
            />

            {/* Breadcrumb for Pricing */}
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
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'Pricing',
                                item: 'https://secpilot.com/pricing',
                            },
                        ],
                    }),
                }}
            />

            <main className='relative min-h-screen bg-neutral-950'>
                {/* Enhanced unified background with subtle animations - same as home page */}
                <div className='fixed inset-0 pointer-events-none'>
                    {/* Main background gradient */}
                    <div className='absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900' />

                    {/* Subtle radial gradients for depth */}
                    <div className='absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl' />
                    <div className='absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl' />
                    <div className='absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/4 rounded-full blur-3xl' />

                    {/* Animated floating orbs */}
                    <div className='absolute top-20 right-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl animate-pulse' />
                    <div
                        className='absolute bottom-32 left-20 w-24 h-24 bg-blue-500/8 rounded-full blur-2xl animate-pulse'
                        style={{ animationDelay: '2s' }}
                    />

                    {/* Floating particles */}
                    <div className='absolute inset-0'>
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className='absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse'
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 4}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Animated grid pattern - more visible */}
                    <div className='absolute inset-0 opacity-[0.08] animate-grid-flow bg-grid-pattern' />

                    {/* Flowing diagonal lines */}
                    <div className='absolute inset-0 opacity-[0.04] animate-diagonal-flow bg-diagonal-pattern' />

                    {/* Subtle moving glow */}
                    <div className='absolute w-96 h-96 rounded-full opacity-30 animate-floating-glow bg-glow-pattern' />

                    {/* Noise texture for premium feel */}
                    <div
                        className='absolute inset-0 opacity-[0.015]'
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                {/* Page content with proper z-index */}
                <div className='relative z-10'>
                    {/* Header Section */}
                    <section className='py-10 sm:py-40'>
                        <Container className='max-w-4xl mx-auto text-center'>
                            <FeatureIconContainer className='flex justify-center items-center overflow-hidden mx-auto'>
                                <div className='relative'>
                                    <IconReceiptFilled className='h-6 w-6 text-emerald-800' />
                                </div>
                            </FeatureIconContainer>
                            <Heading as='h1' className='pt-4'>
                                Simple, Transparent Email Security Pricing
                            </Heading>
                            <Subheading className='max-w-2xl mx-auto'>
                                Protect your business from email threats with plans that scale from
                                individual professionals to enterprise teams. All plans include
                                AI-powered threat detection, real-time protection, and zero-storage
                                privacy.
                            </Subheading>
                        </Container>
                    </section>

                    {/* Pricing Section with Stripe Integration */}
                    <section aria-label='Pricing plans' className='-mt-20'>
                        <PricingSection />
                    </section>

                    {/* Social Proof */}
                    {/* <section aria-label="Customer testimonials" className="py-20">
              <TestimonialsMarquee />
            </section> */}

                    {/* FAQ Section */}
                    {/* <section aria-label="Pricing FAQ">
              <FAQs />
            </section> */}

                    {/* Final CTA */}
                    {/* <section aria-label="Get started">
              <CTA />
            </section> */}
                </div>
            </main>
        </>
    );
}
