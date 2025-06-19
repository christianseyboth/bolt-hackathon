import { Metadata } from 'next';
import { BackgroundEffects } from '@/components/background-effects';

export const metadata: Metadata = {
    title: 'Terms of Service | SecPilot',
    description:
        "SecPilot's terms of service outlining the conditions for using our AI-powered email security platform.",
    openGraph: {
        title: 'Terms of Service | SecPilot',
        description:
            "SecPilot's terms of service outlining the conditions for using our AI-powered email security platform.",
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Terms of Service | SecPilot',
        description:
            "SecPilot's terms of service outlining the conditions for using our AI-powered email security platform.",
    },
};

export default function TermsOfServicePage() {
    return (
        <main className='relative min-h-screen bg-neutral-950'>
            <BackgroundEffects />

            <div className='relative z-10 container mx-auto px-4 py-16 max-w-4xl'>
                <div className='space-y-8'>
                    <div className='text-center space-y-4'>
                        <h1 className='text-4xl font-bold tracking-tight text-white'>
                            Terms of Service
                        </h1>
                        <p className='text-lg text-neutral-400'>
                            Last updated:{' '}
                            {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>

                    <div className='prose prose-lg max-w-none prose-invert prose-headings:text-white prose-p:text-neutral-300 prose-li:text-neutral-300 prose-strong:text-white'>
                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Agreement to Terms</h2>
                            <p>
                                By accessing and using SecPilot's email security services, you
                                accept and agree to be bound by the terms and provision of this
                                agreement. These Terms of Service ("Terms") govern your use of our
                                AI-powered email security platform.
                            </p>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Service Description</h2>
                            <p>
                                SecPilot provides advanced AI-powered email security services
                                including:
                            </p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>Real-time threat detection and prevention</li>
                                <li>Phishing and malware protection</li>
                                <li>Business email compromise (BEC) prevention</li>
                                <li>Advanced persistent threat (APT) detection</li>
                                <li>Compliance monitoring and reporting</li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Acceptable Use Policy</h2>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-medium'>Permitted Uses</h3>
                                <p>You may use SecPilot services for:</p>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Protecting your organization's email communications</li>
                                    <li>Monitoring and preventing email-based security threats</li>
                                    <li>Ensuring compliance with industry regulations</li>
                                    <li>Legitimate business communications security</li>
                                </ul>

                                <h3 className='text-xl font-medium'>Prohibited Uses</h3>
                                <p>You may not use SecPilot services for:</p>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Any illegal or unauthorized purpose</li>
                                    <li>
                                        Violating any international, federal, provincial or state
                                        regulations, rules, laws, or local ordinances
                                    </li>
                                    <li>
                                        Transmitting malware, viruses, or any other malicious code
                                    </li>
                                    <li>
                                        Attempting to interfere with, compromise the security of, or
                                        decipher any transmissions
                                    </li>
                                    <li>
                                        Taking any action that imposes an unreasonable load on our
                                        infrastructure
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Account Responsibilities</h2>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>Maintain the security of your account credentials</li>
                                <li>Notify us immediately of any unauthorized access</li>
                                <li>Ensure accurate and up-to-date account information</li>
                                <li>Comply with all applicable laws and regulations</li>
                                <li>Monitor and review security alerts and recommendations</li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Service Level Agreement</h2>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-medium'>Uptime Guarantee</h3>
                                <p>
                                    SecPilot guarantees 99.9% uptime for our email security
                                    services. If we fail to meet this commitment, you may be
                                    eligible for service credits as outlined in our SLA.
                                </p>

                                <h3 className='text-xl font-medium'>Support Response Times</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>
                                        <strong>Critical Issues:</strong> 1 hour response time
                                    </li>
                                    <li>
                                        <strong>High Priority:</strong> 4 hours response time
                                    </li>
                                    <li>
                                        <strong>Medium Priority:</strong> 24 hours response time
                                    </li>
                                    <li>
                                        <strong>Low Priority:</strong> 72 hours response time
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Data Processing and Privacy</h2>
                            <p>SecPilot operates under a zero-storage privacy model:</p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>Email content is analyzed in real-time and not stored</li>
                                <li>Only security metadata is temporarily processed</li>
                                <li>
                                    All processing complies with GDPR, CCPA, and other privacy
                                    regulations
                                </li>
                                <li>You retain full ownership and control of your data</li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Billing and Payment</h2>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>
                                    Subscription fees are billed in advance on a monthly or annual
                                    basis
                                </li>
                                <li>All fees are non-refundable except as required by law</li>
                                <li>Price changes will be communicated 30 days in advance</li>
                                <li>Failure to pay may result in service suspension</li>
                                <li>Taxes are calculated based on your billing address</li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, SecPilot shall not be liable
                                for any indirect, incidental, special, consequential, or punitive
                                damages, including but not limited to loss of profits, data, or use,
                                arising out of or relating to these terms or your use of the
                                service.
                            </p>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Termination</h2>
                            <p>
                                Either party may terminate this agreement with 30 days written
                                notice. Upon termination:
                            </p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>Your access to the service will be discontinued</li>
                                <li>All data will be securely deleted within 30 days</li>
                                <li>Outstanding fees remain due and payable</li>
                                <li>Survival clauses will remain in effect</li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Contact Information</h2>
                            <p>For questions about these Terms of Service, please contact us:</p>
                            <div className='bg-neutral-800/50 border border-neutral-700 p-6 rounded-lg'>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Email:</strong>{' '}
                                    legal@secpilot.com
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Address:</strong> SecPilot Inc.,
                                    Legal Department
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Phone:</strong> +1 (555) 123-4567
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
