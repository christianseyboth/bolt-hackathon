import { Metadata } from 'next';
import { BackgroundEffects } from '@/components/BackgroundEffects';

export const metadata: Metadata = {
    title: 'Privacy Policy | SecPilot',
    description:
        "SecPilot's comprehensive privacy policy detailing how we protect your data and maintain zero-storage email security.",
    openGraph: {
        title: 'Privacy Policy | SecPilot',
        description:
            "SecPilot's comprehensive privacy policy detailing how we protect your data and maintain zero-storage email security.",
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Privacy Policy | SecPilot',
        description:
            "SecPilot's comprehensive privacy policy detailing how we protect your data and maintain zero-storage email security.",
    },
};

export default function PrivacyPolicyPage() {
    return (
        <main className='relative min-h-screen bg-neutral-950'>
            <BackgroundEffects />

            <div className='relative z-10 container mx-auto px-4 py-16 max-w-4xl'>
                <div className='space-y-8'>
                    <div className='text-center space-y-4'>
                        <h1 className='text-4xl font-bold tracking-tight text-white'>
                            Privacy Policy
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
                            <h2 className='text-2xl font-semibold'>Introduction</h2>
                            <p>
                                At SecPilot, we are committed to protecting your privacy and
                                ensuring the security of your personal information. This Privacy
                                Policy explains how we collect, use, disclose, and safeguard your
                                information when you use our AI-powered email security service.
                            </p>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Zero-Storage Privacy Model</h2>
                            <p>
                                SecPilot operates on a <strong>zero-storage privacy model</strong>.
                                This means:
                            </p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>We do not store or retain your email content</li>
                                <li>Email analysis happens in real-time during transit</li>
                                <li>No email data is persisted on our servers</li>
                                <li>
                                    Threat detection metadata is processed and discarded immediately
                                </li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Information We Collect</h2>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-medium'>Account Information</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Email address and name for account creation</li>
                                    <li>Company information for business accounts</li>
                                    <li>Billing and payment information</li>
                                </ul>

                                <h3 className='text-xl font-medium'>Service Usage Data</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Security event logs and threat detection statistics</li>
                                    <li>API usage metrics and performance data</li>
                                    <li>System diagnostic information</li>
                                </ul>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>How We Use Your Information</h2>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>Provide and maintain our email security services</li>
                                <li>Process billing and manage your account</li>
                                <li>Improve our threat detection algorithms</li>
                                <li>Send important service updates and security notifications</li>
                                <li>Comply with legal obligations and regulations</li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Data Security</h2>
                            <p>We implement industry-leading security measures including:</p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>End-to-end encryption for all data in transit</li>
                                <li>SOC 2 Type II compliance</li>
                                <li>Regular security audits and penetration testing</li>
                                <li>Multi-factor authentication for all accounts</li>
                                <li>Zero-trust network architecture</li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>International Compliance</h2>
                            <p>SecPilot complies with major international privacy regulations:</p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>
                                    <strong>GDPR</strong> - European data protection requirements
                                </li>
                                <li>
                                    <strong>CCPA</strong> - California Consumer Privacy Act
                                </li>
                                <li>
                                    <strong>PIPEDA</strong> - Canadian privacy legislation
                                </li>
                                <li>
                                    <strong>SOX</strong> - Financial data protection standards
                                </li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>Access your personal information</li>
                                <li>Correct inaccurate data</li>
                                <li>Delete your account and associated data</li>
                                <li>Export your data in a portable format</li>
                                <li>Withdraw consent for data processing</li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy or our data
                                practices, please contact us:
                            </p>
                            <div className='bg-neutral-800/50 border border-neutral-700 p-6 rounded-lg'>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Email:</strong>{' '}
                                    privacy@secpilot.com
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Address:</strong> SecPilot Inc.,
                                    Privacy Department
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
