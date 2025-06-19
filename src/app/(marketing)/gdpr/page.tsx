import { Metadata } from 'next';
import { BackgroundEffects } from '@/components/background-effects';

export const metadata: Metadata = {
    title: 'GDPR Compliance | SecPilot',
    description:
        "SecPilot's GDPR compliance information and data protection measures for European users.",
    openGraph: {
        title: 'GDPR Compliance | SecPilot',
        description:
            "SecPilot's GDPR compliance information and data protection measures for European users.",
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GDPR Compliance | SecPilot',
        description:
            "SecPilot's GDPR compliance information and data protection measures for European users.",
    },
};

export default function GDPRPage() {
    return (
        <main className='relative min-h-screen bg-neutral-950'>
            <BackgroundEffects />

            <div className='relative z-10 container mx-auto px-4 py-16 max-w-4xl'>
                <div className='space-y-8'>
                    <div className='text-center space-y-4'>
                        <h1 className='text-4xl font-bold tracking-tight text-white'>
                            GDPR Compliance
                        </h1>
                        <p className='text-lg text-neutral-400'>
                            General Data Protection Regulation Compliance
                        </p>
                        <p className='text-sm text-neutral-500'>
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
                            <h2 className='text-2xl font-semibold'>GDPR Commitment</h2>
                            <p>
                                SecPilot is committed to complying with the General Data Protection
                                Regulation (GDPR) and ensuring the protection of personal data for
                                all individuals within the European Union. We have implemented
                                comprehensive measures to ensure your data rights are respected and
                                protected.
                            </p>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Legal Basis for Processing</h2>
                            <p>
                                SecPilot processes personal data based on the following legal
                                grounds:
                            </p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>
                                    <strong>Contractual Necessity:</strong> To provide our email
                                    security services as outlined in our service agreement
                                </li>
                                <li>
                                    <strong>Legitimate Interest:</strong> To improve our threat
                                    detection capabilities and service quality
                                </li>
                                <li>
                                    <strong>Consent:</strong> For marketing communications and
                                    optional features (where explicitly obtained)
                                </li>
                                <li>
                                    <strong>Legal Obligation:</strong> To comply with applicable
                                    laws and regulations
                                </li>
                                <li>
                                    <strong>Vital Interest:</strong> To protect against imminent
                                    security threats
                                </li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Your GDPR Rights</h2>
                            <p>
                                Under GDPR, you have the following rights regarding your personal
                                data:
                            </p>

                            <div className='space-y-4'>
                                <div className='border-l-4 border-blue-400 pl-4 bg-blue-950/20 p-4 rounded-r-lg'>
                                    <h3 className='text-xl font-medium text-white'>
                                        Right to Information
                                    </h3>
                                    <p className='text-neutral-300'>
                                        You have the right to be informed about how your personal
                                        data is being used.
                                    </p>
                                </div>

                                <div className='border-l-4 border-green-400 pl-4 bg-green-950/20 p-4 rounded-r-lg'>
                                    <h3 className='text-xl font-medium text-white'>
                                        Right of Access
                                    </h3>
                                    <p className='text-neutral-300'>
                                        You can request access to your personal data and receive a
                                        copy of the personal data we hold about you.
                                    </p>
                                </div>

                                <div className='border-l-4 border-yellow-400 pl-4 bg-yellow-950/20 p-4 rounded-r-lg'>
                                    <h3 className='text-xl font-medium text-white'>
                                        Right to Rectification
                                    </h3>
                                    <p className='text-neutral-300'>
                                        You can request that we correct any inaccurate or incomplete
                                        personal data.
                                    </p>
                                </div>

                                <div className='border-l-4 border-red-400 pl-4 bg-red-950/20 p-4 rounded-r-lg'>
                                    <h3 className='text-xl font-medium text-white'>
                                        Right to Erasure ("Right to be Forgotten")
                                    </h3>
                                    <p className='text-neutral-300'>
                                        You can request deletion of your personal data under certain
                                        circumstances.
                                    </p>
                                </div>

                                <div className='border-l-4 border-purple-400 pl-4 bg-purple-950/20 p-4 rounded-r-lg'>
                                    <h3 className='text-xl font-medium text-white'>
                                        Right to Restrict Processing
                                    </h3>
                                    <p className='text-neutral-300'>
                                        You can request that we limit the processing of your
                                        personal data in specific situations.
                                    </p>
                                </div>

                                <div className='border-l-4 border-indigo-400 pl-4 bg-indigo-950/20 p-4 rounded-r-lg'>
                                    <h3 className='text-xl font-medium text-white'>
                                        Right to Data Portability
                                    </h3>
                                    <p className='text-neutral-300'>
                                        You can request to receive your personal data in a
                                        structured, commonly used format.
                                    </p>
                                </div>

                                <div className='border-l-4 border-pink-400 pl-4 bg-pink-950/20 p-4 rounded-r-lg'>
                                    <h3 className='text-xl font-medium text-white'>
                                        Right to Object
                                    </h3>
                                    <p className='text-neutral-300'>
                                        You can object to the processing of your personal data based
                                        on legitimate interests.
                                    </p>
                                </div>

                                <div className='border-l-4 border-gray-400 pl-4 bg-gray-950/20 p-4 rounded-r-lg'>
                                    <h3 className='text-xl font-medium text-white'>
                                        Rights Related to Automated Decision Making
                                    </h3>
                                    <p className='text-neutral-300'>
                                        You have rights regarding automated processing and profiling
                                        that affects you.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Data Processing Activities</h2>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-medium'>Personal Data We Process</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>
                                        <strong>Identity Data:</strong> Name, email address, company
                                        information
                                    </li>
                                    <li>
                                        <strong>Contact Data:</strong> Billing address, delivery
                                        address, phone numbers
                                    </li>
                                    <li>
                                        <strong>Financial Data:</strong> Payment card details, bank
                                        account information
                                    </li>
                                    <li>
                                        <strong>Technical Data:</strong> IP address, login data,
                                        browser type and version
                                    </li>
                                    <li>
                                        <strong>Usage Data:</strong> Information about how you use
                                        our service
                                    </li>
                                    <li>
                                        <strong>Security Data:</strong> Threat detection logs and
                                        security event metadata
                                    </li>
                                </ul>

                                <h3 className='text-xl font-medium'>Data Processing Purposes</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Providing email security services</li>
                                    <li>Managing your account and billing</li>
                                    <li>Improving our threat detection algorithms</li>
                                    <li>Communicating with you about service updates</li>
                                    <li>Complying with legal and regulatory requirements</li>
                                </ul>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Data Protection Measures</h2>
                            <p>
                                SecPilot implements robust technical and organizational measures to
                                protect your personal data:
                            </p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>
                                    <strong>Encryption:</strong> All data is encrypted in transit
                                    and at rest using industry-standard encryption
                                </li>
                                <li>
                                    <strong>Access Controls:</strong> Strict access controls and
                                    authentication mechanisms
                                </li>
                                <li>
                                    <strong>Data Minimization:</strong> We only collect and process
                                    data necessary for our services
                                </li>
                                <li>
                                    <strong>Pseudonymization:</strong> Personal data is
                                    pseudonymized where possible
                                </li>
                                <li>
                                    <strong>Regular Audits:</strong> Regular security audits and
                                    compliance assessments
                                </li>
                                <li>
                                    <strong>Staff Training:</strong> Regular GDPR and data
                                    protection training for all staff
                                </li>
                                <li>
                                    <strong>Incident Response:</strong> Comprehensive data breach
                                    response procedures
                                </li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Data Transfers</h2>
                            <p>
                                When transferring personal data outside the European Economic Area
                                (EEA), SecPilot ensures adequate protection through:
                            </p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>
                                    Standard Contractual Clauses (SCCs) approved by the European
                                    Commission
                                </li>
                                <li>Adequacy decisions where available</li>
                                <li>Additional safeguards and impact assessments</li>
                                <li>Regular monitoring of transfer conditions</li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Data Retention</h2>
                            <p>
                                We retain personal data only for as long as necessary to fulfill the
                                purposes for which it was collected:
                            </p>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>
                                    <strong>Account Data:</strong> Retained while your account is
                                    active plus 7 years for legal obligations
                                </li>
                                <li>
                                    <strong>Billing Data:</strong> Retained for 7 years for
                                    accounting and tax purposes
                                </li>
                                <li>
                                    <strong>Security Logs:</strong> Retained for 12 months for
                                    threat analysis
                                </li>
                                <li>
                                    <strong>Marketing Data:</strong> Retained until consent is
                                    withdrawn
                                </li>
                                <li>
                                    <strong>Email Content:</strong> Not stored - processed in
                                    real-time only
                                </li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Exercising Your Rights</h2>
                            <p>
                                To exercise any of your GDPR rights, please contact our Data
                                Protection Officer:
                            </p>
                            <div className='bg-neutral-800/50 border border-neutral-700 p-6 rounded-lg space-y-2'>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Email:</strong> dpo@secpilot.com
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Subject Line:</strong> GDPR Data
                                    Subject Request
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Response Time:</strong> We will
                                    respond within 30 days
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Verification:</strong> We may
                                    require identity verification for security purposes
                                </p>
                            </div>
                            <p className='text-sm text-neutral-500'>
                                If you are not satisfied with our response, you have the right to
                                lodge a complaint with your local supervisory authority.
                            </p>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Contact Information</h2>
                            <div className='grid md:grid-cols-2 gap-4'>
                                <div className='bg-neutral-800/50 border border-neutral-700 p-4 rounded-lg'>
                                    <h3 className='font-medium mb-2 text-white'>
                                        Data Protection Officer
                                    </h3>
                                    <p className='text-neutral-300'>
                                        <strong className='text-white'>Email:</strong>{' '}
                                        dpo@secpilot.com
                                    </p>
                                    <p className='text-neutral-300'>
                                        <strong className='text-white'>Address:</strong> SecPilot
                                        Inc., DPO Department
                                    </p>
                                </div>
                                <div className='bg-neutral-800/50 border border-neutral-700 p-4 rounded-lg'>
                                    <h3 className='font-medium mb-2 text-white'>
                                        EU Representative
                                    </h3>
                                    <p className='text-neutral-300'>
                                        <strong className='text-white'>Email:</strong>{' '}
                                        eu-rep@secpilot.com
                                    </p>
                                    <p className='text-neutral-300'>
                                        <strong className='text-white'>Address:</strong> SecPilot EU
                                        Representative
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
