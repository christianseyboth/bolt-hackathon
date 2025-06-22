import { Metadata } from 'next';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import {
    IconShieldCheck,
    IconMail,
    IconBolt,
    IconUsers,
    IconGlobe,
    IconArrowRight,
} from '@tabler/icons-react';
import { Button } from '@/components/Button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About SecPilot | AI-Powered Email Security Company',
    description:
        "Learn about SecPilot's mission to protect businesses from email threats using advanced AI technology. Discover our story, values, and commitment to cybersecurity.",
    openGraph: {
        title: 'About SecPilot | AI-Powered Email Security Company',
        description:
            "Learn about SecPilot's mission to protect businesses from email threats using advanced AI technology.",
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About SecPilot | AI-Powered Email Security Company',
        description:
            "Learn about SecPilot's mission to protect businesses from email threats using advanced AI technology.",
    },
};

export default function AboutPage() {
    const stats = [
        {
            value: '99.9%',
            label: 'Threat Detection Accuracy',
            icon: <IconShieldCheck className='h-8 w-8 text-green-400' />,
        },
        {
            value: '10,000+',
            label: 'Individuals Protected',
            icon: <IconUsers className='h-8 w-8 text-blue-400' />,
        },
        {
            value: '5M+',
            label: 'Emails Analyzed Yearly',
            icon: <IconMail className='h-8 w-8 text-purple-400' />,
        },
        {
            value: '<1ms',
            label: 'Average Processing Time',
            icon: <IconBolt className='h-8 w-8 text-yellow-400' />,
        },
    ];

    const values = [
        {
            title: 'Security First',
            description:
                "We believe that robust security shouldn't come at the cost of usability. Our solutions are designed to be both comprehensive and user-friendly.",
            icon: <IconShieldCheck className='h-12 w-12 text-emerald-400' />,
        },
        {
            title: 'Privacy by Design',
            description:
                'Our zero-storage architecture ensures that your email content never leaves your infrastructure, maintaining complete privacy and compliance.',
            icon: <IconBolt className='h-12 w-12 text-blue-400' />,
        },
        {
            title: 'Innovation',
            description:
                'We continuously push the boundaries of AI and machine learning to stay ahead of evolving cyber threats and protect our customers.',
            icon: <IconBolt className='h-12 w-12 text-purple-400' />,
        },
        {
            title: 'Global Impact',
            description:
                'Our mission extends beyond individual businesses to creating a safer digital ecosystem for organizations worldwide.',
            icon: <IconGlobe className='h-12 w-12 text-orange-400' />,
        },
    ];

    return (
        <main className='relative min-h-screen bg-neutral-950 mt-24'>
            <BackgroundEffects />

            <div className='relative z-10 py-12'>
                {/* Hero Section */}
                <section className='container mx-auto px-4 py-4 max-w-6xl '>
                    <div className='text-center space-y-6 mb-16'>
                        <h1 className='text-5xl md:text-6xl font-bold tracking-tight text-white'>
                            About SecPilot
                        </h1>
                        <p className='text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed'>
                            We're on a mission to protect businesses from the evolving landscape of
                            email threats using cutting-edge AI technology and zero-storage privacy
                            architecture.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20'>
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className='bg-neutral-800/50 border border-neutral-700 p-6 rounded-xl text-center hover:bg-neutral-800/70 transition-all duration-300'
                            >
                                <div className='flex justify-center mb-4'>{stat.icon}</div>
                                <div className='text-2xl md:text-3xl font-bold text-white mb-2'>
                                    {stat.value}
                                </div>
                                <div className='text-sm text-neutral-400'>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Mission Section */}
                <section className='container mx-auto px-4 max-w-6xl'>
                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        <div className='space-y-6'>
                            <h2 className='text-4xl font-bold text-white'>Our Mission</h2>
                            <p className='text-lg text-neutral-300 leading-relaxed'>
                                Email remains the primary attack vector for cybercriminals, with
                                over 90% of successful cyber attacks starting with a malicious
                                email. Traditional security solutions are failing to keep pace with
                                increasingly sophisticated threats.
                            </p>
                            <p className='text-lg text-neutral-300 leading-relaxed'>
                                SecPilot was founded to solve this critical problem. We combine
                                advanced artificial intelligence with a privacy-first approach to
                                deliver email security that actually works - stopping threats before
                                they reach your inbox while protecting your organization's sensitive
                                data.
                            </p>
                            <div className='bg-blue-950/30 border border-blue-800/50 p-6 rounded-lg'>
                                <p className='text-blue-300 font-medium'>
                                    "To create a world where businesses can communicate safely and
                                    confidently, free from the fear of email-based cyber threats."
                                </p>
                                <p className='text-neutral-400 text-sm mt-2'>
                                    - SecPilot Mission Statement
                                </p>
                            </div>
                        </div>
                        <div className='bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-8 rounded-2xl'>
                            <div className='space-y-4'>
                                <h3 className='text-2xl font-semibold text-white'>
                                    The Problem We Solve
                                </h3>
                                <ul className='space-y-3 text-neutral-300'>
                                    <li className='flex items-start space-x-3'>
                                        <div className='w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0'></div>
                                        <span>
                                            95% of successful breaches start with phishing emails
                                        </span>
                                    </li>
                                    <li className='flex items-start space-x-3'>
                                        <div className='w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0'></div>
                                        <span>Average cost of a data breach: $4.45 million</span>
                                    </li>
                                    <li className='flex items-start space-x-3'>
                                        <div className='w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0'></div>
                                        <span>
                                            Traditional filters miss 15% of sophisticated attacks
                                        </span>
                                    </li>
                                    <li className='flex items-start space-x-3'>
                                        <div className='w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0'></div>
                                        <span>
                                            Privacy concerns with cloud-based email scanning
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className='container mx-auto px-4 py-16 max-w-6xl'>
                    <div className='text-center mb-16'>
                        <h2 className='text-4xl font-bold text-white mb-6'>Our Core Values</h2>
                        <p className='text-lg text-neutral-400 max-w-3xl mx-auto'>
                            These principles guide everything we do, from product development to
                            customer relationships.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 gap-8'>
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className='bg-neutral-800/30 border border-neutral-700 p-8 rounded-xl hover:bg-neutral-800/50 transition-all duration-300'
                            >
                                <div className='mb-6'>{value.icon}</div>
                                <h3 className='text-2xl font-semibold text-white mb-4'>
                                    {value.title}
                                </h3>
                                <p className='text-neutral-300 leading-relaxed'>
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Technology Section */}
                <section className='container mx-auto px-4 py-16 max-w-6xl'>
                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        <div className='bg-gradient-to-br from-emerald-600/20 to-blue-600/20 border border-emerald-500/30 p-8 rounded-2xl'>
                            <h3 className='text-2xl font-semibold text-white mb-6'>
                                Our Technology Edge
                            </h3>
                            <div className='space-y-4'>
                                <div className='flex items-center space-x-3'>
                                    <IconShieldCheck className='h-6 w-6 text-emerald-400' />
                                    <span className='text-neutral-300'>
                                        Advanced AI threat detection
                                    </span>
                                </div>
                                <div className='flex items-center space-x-3'>
                                    <IconBolt className='h-6 w-6 text-blue-400' />
                                    <span className='text-neutral-300'>
                                        Zero-storage privacy architecture
                                    </span>
                                </div>
                                <div className='flex items-center space-x-3'>
                                    <IconBolt className='h-6 w-6 text-purple-400' />
                                    <span className='text-neutral-300'>
                                        Real-time processing & response
                                    </span>
                                </div>
                                <div className='flex items-center space-x-3'>
                                    <IconGlobe className='h-6 w-6 text-orange-400' />
                                    <span className='text-neutral-300'>
                                        Global threat intelligence network
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='space-y-6'>
                            <h2 className='text-4xl font-bold text-white'>
                                Innovation at Our Core
                            </h2>
                            <p className='text-lg text-neutral-300 leading-relaxed'>
                                Our proprietary AI models are trained on billions of email samples
                                and continuously updated to recognize new attack patterns. Unlike
                                traditional signature-based detection, our system understands
                                context, intent, and behavioral anomalies.
                            </p>
                            <p className='text-lg text-neutral-300 leading-relaxed'>
                                What sets us apart is our zero-storage approach - your emails are
                                analyzed in real-time without ever being stored on our servers,
                                ensuring complete privacy and compliance with the strictest data
                                protection regulations.
                            </p>
                            <div className='grid grid-cols-2 gap-4 pt-6'>
                                <div className='text-center'>
                                    <div className='text-3xl font-bold text-emerald-400 mb-2'>
                                        99.9%
                                    </div>
                                    <div className='text-sm text-neutral-400'>Accuracy Rate</div>
                                </div>
                                <div className='text-center'>
                                    <div className='text-3xl font-bold text-blue-400 mb-2'>
                                        &lt;0.01%
                                    </div>
                                    <div className='text-sm text-neutral-400'>False Positives</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Commitment Section */}
                <section className='container mx-auto px-4 py-16 max-w-6xl'>
                    <div className='bg-neutral-800/30 border border-neutral-700 rounded-2xl p-8 md:p-12 text-center'>
                        <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
                            Our Commitment to You
                        </h2>
                        <p className='text-lg text-neutral-300 max-w-4xl mx-auto leading-relaxed mb-8'>
                            We're not just building software - we're building trust. Every decision
                            we make prioritizes your security, privacy, and success. Our team of
                            cybersecurity experts, AI researchers, and engineers work tirelessly to
                            stay ahead of threats and deliver solutions that actually work.
                        </p>
                        <div className='grid md:grid-cols-3 gap-6 mt-12'>
                            <div className='space-y-3'>
                                <div className='text-2xl font-bold text-emerald-400'>24/7</div>
                                <div className='text-neutral-300'>Expert Support</div>
                            </div>
                            <div className='space-y-3'>
                                <div className='text-2xl font-bold text-blue-400'>99.9%</div>
                                <div className='text-neutral-300'>Uptime SLA</div>
                            </div>
                            <div className='space-y-3'>
                                <div className='text-2xl font-bold text-purple-400'>SOC 2</div>
                                <div className='text-neutral-300'>Type II Ready</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className='container mx-auto px-4 py-16 max-w-4xl text-center'>
                    <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
                        Ready to Experience Next-Generation Email Security?
                    </h2>
                    <p className='text-lg text-neutral-400 mb-8 max-w-2xl mx-auto'>
                        Join thousands of businesses who trust SecPilot to protect their most
                        critical communications.
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Link href='/register'>
                            <Button variant='primary' size='sm' className='flex items-center group'>
                                <span>Start Free Trial</span>
                                <IconArrowRight className='h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200' />
                            </Button>
                        </Link>
                        <Link href='/contact'>
                            <Button variant='muted' size='sm'>
                                Contact Sales
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
