import { ContactFormSimple } from '@/components/marketing/contact-form-simple';
import { FeatureIconContainer } from '@/components/features/feature-icon-container';
import { Heading } from '@/components/heading';
import { Subheading } from '@/components/subheading';
import { Container } from '@/components/container';
import { IconMail, IconShieldCheck, IconHeadset, IconBuildingBank } from '@tabler/icons-react';
import { Metadata } from 'next';
import '@/types/elevenlabs';

export const metadata: Metadata = {
    title: 'Contact SecPilot | Email Security Software Support & Sales',
    description:
        'Contact SecPilot for email security software support, enterprise sales inquiries, and technical assistance. Get help with AI-powered phishing protection and malware detection. 24/7 support available.',
    keywords: [
        'contact SecPilot',
        'email security support',
        'cybersecurity technical support',
        'enterprise sales inquiry',
        'phishing protection help',
        'email security consultation',
        'technical assistance',
        'customer support',
    ],
    openGraph: {
        title: 'Contact SecPilot | Expert Email Security Support',
        description:
            'Get expert help with email security. Contact our team for technical support, sales inquiries, or security consultations.',
        type: 'website',
        url: 'https://secpilot.com/contact',
        images: ['/og-contact.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Contact SecPilot | Email Security Support',
        description:
            'Expert email security support and consultation. Get help from our security professionals.',
        images: ['/twitter-contact.png'],
    },
    alternates: {
        canonical: 'https://secpilot.com/contact',
    },
};

export default function ContactPage() {
    return (
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
                <section className='py-20 sm:py-40'>
                    <Container className='max-w-4xl mx-auto text-center'>
                        <FeatureIconContainer className='flex justify-center items-center overflow-hidden mx-auto'>
                            <div className='relative'>
                                <IconMail className='h-6 w-6 text-emerald-800' />
                            </div>
                        </FeatureIconContainer>
                        <Heading as='h1' className='pt-4'>
                            Get Expert Email Security Support
                        </Heading>
                        <Subheading className='max-w-2xl mx-auto'>
                            Whether you need technical support, have enterprise sales questions, or
                            want to learn more about protecting your organization from email threats
                            - our security experts are here to help.
                        </Subheading>
                    </Container>
                </section>

                {/* Contact Options */}
                <section className='py-12'>
                    <Container className='max-w-6xl mx-auto'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
                            {/* Sales */}
                            <div className='text-center p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl hover:border-emerald-500/30 transition-all duration-200'>
                                <div className='flex justify-center mb-4'>
                                    <div className='p-3 bg-emerald-500/20 rounded-lg'>
                                        <IconBuildingBank className='h-6 w-6 text-emerald-400' />
                                    </div>
                                </div>
                                <h3 className='text-lg font-semibold mb-2'>Enterprise Sales</h3>
                                <p className='text-neutral-400 text-sm mb-4'>
                                    Custom pricing and solutions for large organizations
                                </p>
                                <p className='text-emerald-400 font-medium'>sales@secpilot.com</p>
                            </div>

                            {/* Support */}
                            <div className='text-center p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl hover:border-emerald-500/30 transition-all duration-200'>
                                <div className='flex justify-center mb-4'>
                                    <div className='p-3 bg-blue-500/20 rounded-lg'>
                                        <IconHeadset className='h-6 w-6 text-blue-400' />
                                    </div>
                                </div>
                                <h3 className='text-lg font-semibold mb-2'>Technical Support</h3>
                                <p className='text-neutral-400 text-sm mb-4'>
                                    Get help with setup, configuration, and troubleshooting
                                </p>
                                <p className='text-blue-400 font-medium'>support@secpilot.com</p>
                            </div>

                            {/* Security */}
                            <div className='text-center p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl hover:border-emerald-500/30 transition-all duration-200'>
                                <div className='flex justify-center mb-4'>
                                    <div className='p-3 bg-purple-500/20 rounded-lg'>
                                        <IconShieldCheck className='h-6 w-6 text-purple-400' />
                                    </div>
                                </div>
                                <h3 className='text-lg font-semibold mb-2'>Security Inquiries</h3>
                                <p className='text-neutral-400 text-sm mb-4'>
                                    Report vulnerabilities or security-related questions
                                </p>
                                <p className='text-purple-400 font-medium'>security@secpilot.com</p>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* Contact Form */}
                <section aria-label='Contact form'>
                    <ContactFormSimple />
                </section>

                {/* Response Time Guarantee */}
                <section className='py-16'>
                    <Container className='max-w-4xl mx-auto text-center'>
                        <div className='bg-neutral-900/30 border border-neutral-800 rounded-xl p-8'>
                            <h3 className='text-xl font-semibold mb-4'>
                                Our Response Time Guarantee
                            </h3>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-sm'>
                                <div>
                                    <div className='text-2xl font-bold text-emerald-400 mb-2'>
                                        2 hours
                                    </div>
                                    <p className='text-neutral-400'>Technical support response</p>
                                </div>
                                <div>
                                    <div className='text-2xl font-bold text-blue-400 mb-2'>
                                        24 hours
                                    </div>
                                    <p className='text-neutral-400'>Sales inquiry response</p>
                                </div>
                                <div>
                                    <div className='text-2xl font-bold text-purple-400 mb-2'>
                                        15 min
                                    </div>
                                    <p className='text-neutral-400'>
                                        Emergency support (Enterprise)
                                    </p>
                                </div>
                            </div>
                            <p className='text-xs text-neutral-500 mt-6'>
                                Response times apply during business hours (Mon-Fri, 9AM-6PM EST).
                                Enterprise customers receive 24/7 priority support.
                            </p>
                        </div>
                    </Container>
                </section>
            </div>

            {/* ElevenLabs ConvAI Widget */}
            <elevenlabs-convai agent-id='agent_01jvw1s8axewkvfpz9grfdzrtz'></elevenlabs-convai>
            <script
                src='https://unpkg.com/@elevenlabs/convai-widget-embed'
                async
                type='text/javascript'
            ></script>
        </main>
    );
}
