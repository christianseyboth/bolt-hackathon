import { Metadata } from 'next';
import { BackgroundEffects } from '@/components/BackgroundEffects';

export const metadata: Metadata = {
    title: 'Security Policy | SecPilot',
    description:
        "SecPilot's comprehensive security policy outlining our security practices, compliance measures, and data protection standards.",
    openGraph: {
        title: 'Security Policy | SecPilot',
        description:
            "SecPilot's comprehensive security policy outlining our security practices, compliance measures, and data protection standards.",
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Security Policy | SecPilot',
        description:
            "SecPilot's comprehensive security policy outlining our security practices, compliance measures, and data protection standards.",
    },
};

export default function SecurityPolicyPage() {
    return (
        <main className='relative min-h-screen bg-neutral-950'>
            <BackgroundEffects />

            <div className='relative z-10 container mx-auto px-4 py-16 max-w-4xl'>
                <div className='space-y-8'>
                    <div className='text-center space-y-4'>
                        <h1 className='text-4xl font-bold tracking-tight text-white'>
                            Security Policy
                        </h1>
                        <p className='text-lg text-neutral-400'>
                            Comprehensive security practices and compliance measures
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
                            <h2 className='text-2xl font-semibold'>Security Commitment</h2>
                            <p>
                                SecPilot is committed to maintaining the highest standards of
                                security to protect our customers' data and systems. Our security
                                program is built on industry best practices, continuous monitoring,
                                and proactive threat mitigation.
                            </p>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Security Framework</h2>
                            <div className='grid md:grid-cols-2 gap-6'>
                                <div className='bg-blue-950/30 border border-blue-800/50 p-6 rounded-lg'>
                                    <h3 className='text-xl font-medium mb-3 text-blue-300'>
                                        ISO 27001
                                    </h3>
                                    <p className='text-neutral-300'>
                                        Information Security Management System certified and
                                        regularly audited for compliance.
                                    </p>
                                </div>
                                <div className='bg-green-950/30 border border-green-800/50 p-6 rounded-lg'>
                                    <h3 className='text-xl font-medium mb-3 text-green-300'>
                                        SOC 2 Type II
                                    </h3>
                                    <p className='text-neutral-300'>
                                        Annual SOC 2 Type II audits ensuring security, availability,
                                        and confidentiality controls.
                                    </p>
                                </div>
                                <div className='bg-purple-950/30 border border-purple-800/50 p-6 rounded-lg'>
                                    <h3 className='text-xl font-medium mb-3 text-purple-300'>
                                        NIST Framework
                                    </h3>
                                    <p className='text-neutral-300'>
                                        Cybersecurity framework implementation for comprehensive
                                        security management.
                                    </p>
                                </div>
                                <div className='bg-orange-950/30 border border-orange-800/50 p-6 rounded-lg'>
                                    <h3 className='text-xl font-medium mb-3 text-orange-300'>
                                        Zero Trust
                                    </h3>
                                    <p className='text-neutral-300'>
                                        Zero Trust security architecture with continuous
                                        verification and least privilege access.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Data Protection</h2>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-medium'>Encryption Standards</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>
                                        <strong>Data in Transit:</strong> TLS 1.3 encryption for all
                                        communications
                                    </li>
                                    <li>
                                        <strong>Data at Rest:</strong> AES-256 encryption for stored
                                        data
                                    </li>
                                    <li>
                                        <strong>Key Management:</strong> Hardware Security Modules
                                        (HSMs) for key protection
                                    </li>
                                    <li>
                                        <strong>Email Processing:</strong> End-to-end encryption
                                        during real-time analysis
                                    </li>
                                </ul>

                                <h3 className='text-xl font-medium'>Zero-Storage Architecture</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>
                                        Email content processed in real-time without persistent
                                        storage
                                    </li>
                                    <li>
                                        Threat analysis occurs in secure, ephemeral processing
                                        environments
                                    </li>
                                    <li>
                                        Only security metadata temporarily retained for threat
                                        intelligence
                                    </li>
                                    <li>Automatic data purging after processing completion</li>
                                </ul>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Infrastructure Security</h2>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-medium'>Cloud Security</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>
                                        Multi-cloud deployment across AWS, Azure, and Google Cloud
                                    </li>
                                    <li>Infrastructure as Code (IaC) with security scanning</li>
                                    <li>Container security with runtime protection</li>
                                    <li>Automated vulnerability scanning and patching</li>
                                    <li>Network segmentation and micro-segmentation</li>
                                </ul>

                                <h3 className='text-xl font-medium'>Access Controls</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Multi-factor authentication (MFA) for all access</li>
                                    <li>Role-based access control (RBAC) with least privilege</li>
                                    <li>
                                        Privileged access management (PAM) for administrative
                                        accounts
                                    </li>
                                    <li>Just-in-time (JIT) access for elevated permissions</li>
                                    <li>Regular access reviews and deprovisioning</li>
                                </ul>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Threat Detection & Response</h2>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-medium'>
                                    Security Operations Center (SOC)
                                </h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>24/7 security monitoring and incident response</li>
                                    <li>Advanced SIEM and SOAR platforms</li>
                                    <li>Machine learning-based anomaly detection</li>
                                    <li>Threat intelligence integration</li>
                                    <li>Automated response and remediation</li>
                                </ul>

                                <h3 className='text-xl font-medium'>Incident Response</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Defined incident response procedures and playbooks</li>
                                    <li>Security incident classification and escalation</li>
                                    <li>Forensic analysis and evidence preservation</li>
                                    <li>Customer notification within 24 hours</li>
                                    <li>Post-incident reviews and improvements</li>
                                </ul>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Compliance & Certifications</h2>
                            <div className='grid md:grid-cols-3 gap-4'>
                                <div className='text-center p-4 border rounded-lg'>
                                    <h4 className='font-medium'>GDPR</h4>
                                    <p className='text-sm text-muted-foreground'>
                                        Data Protection Regulation
                                    </p>
                                </div>
                                <div className='text-center p-4 border rounded-lg'>
                                    <h4 className='font-medium'>CCPA</h4>
                                    <p className='text-sm text-muted-foreground'>
                                        California Privacy Act
                                    </p>
                                </div>
                                <div className='text-center p-4 border rounded-lg'>
                                    <h4 className='font-medium'>HIPAA</h4>
                                    <p className='text-sm text-muted-foreground'>
                                        Healthcare Compliance
                                    </p>
                                </div>
                                <div className='text-center p-4 border rounded-lg'>
                                    <h4 className='font-medium'>SOX</h4>
                                    <p className='text-sm text-muted-foreground'>
                                        Financial Controls
                                    </p>
                                </div>
                                <div className='text-center p-4 border rounded-lg'>
                                    <h4 className='font-medium'>PCI DSS</h4>
                                    <p className='text-sm text-muted-foreground'>
                                        Payment Security
                                    </p>
                                </div>
                                <div className='text-center p-4 border rounded-lg'>
                                    <h4 className='font-medium'>FedRAMP</h4>
                                    <p className='text-sm text-muted-foreground'>
                                        Government Standards
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Security Testing</h2>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-medium'>Regular Assessments</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>
                                        Annual penetration testing by third-party security firms
                                    </li>
                                    <li>Quarterly vulnerability assessments</li>
                                    <li>Continuous security scanning and monitoring</li>
                                    <li>Red team exercises and simulated attacks</li>
                                    <li>Bug bounty program with ethical hackers</li>
                                </ul>

                                <h3 className='text-xl font-medium'>Development Security</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Secure software development lifecycle (SSDLC)</li>
                                    <li>Static and dynamic application security testing</li>
                                    <li>Code review and security analysis</li>
                                    <li>Dependency scanning and management</li>
                                    <li>Security training for development teams</li>
                                </ul>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Business Continuity</h2>
                            <ul className='list-disc pl-6 space-y-2'>
                                <li>
                                    <strong>Disaster Recovery:</strong> RTO of 4 hours and RPO of 1
                                    hour
                                </li>
                                <li>
                                    <strong>Data Backup:</strong> Automated backups with 99.999%
                                    durability
                                </li>
                                <li>
                                    <strong>Geographic Redundancy:</strong> Multi-region deployment
                                    for high availability
                                </li>
                                <li>
                                    <strong>Failover Testing:</strong> Regular disaster recovery
                                    testing and validation
                                </li>
                                <li>
                                    <strong>Business Continuity Plan:</strong> Comprehensive
                                    continuity procedures
                                </li>
                            </ul>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Employee Security</h2>
                            <div className='space-y-4'>
                                <h3 className='text-xl font-medium'>Personnel Security</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Background checks for all employees</li>
                                    <li>Security awareness training and certification</li>
                                    <li>Regular security updates and phishing simulations</li>
                                    <li>Confidentiality and non-disclosure agreements</li>
                                    <li>Secure offboarding procedures</li>
                                </ul>

                                <h3 className='text-xl font-medium'>Physical Security</h3>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Biometric access controls for office facilities</li>
                                    <li>24/7 surveillance and security monitoring</li>
                                    <li>Secure workstations with endpoint protection</li>
                                    <li>Clean desk policy and secure disposal</li>
                                    <li>Visitor management and escort procedures</li>
                                </ul>
                            </div>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Reporting Security Issues</h2>
                            <p>
                                If you discover a security vulnerability, please report it
                                responsibly:
                            </p>
                            <div className='bg-red-950/30 border border-red-800/50 p-6 rounded-lg'>
                                <h3 className='font-medium mb-3 text-red-300'>Security Contact</h3>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Email:</strong>{' '}
                                    security@secpilot.com
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>PGP Key:</strong> Available on
                                    our website
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Response Time:</strong>{' '}
                                    Acknowledgment within 24 hours
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Bug Bounty:</strong> Rewards for
                                    qualifying vulnerabilities
                                </p>
                            </div>
                            <p className='text-sm text-neutral-500'>
                                Please do not publicly disclose security issues until we have had a
                                chance to address them.
                            </p>
                        </section>

                        <section className='space-y-6'>
                            <h2 className='text-2xl font-semibold'>Questions & Support</h2>
                            <p>
                                For questions about our security practices or to request additional
                                documentation:
                            </p>
                            <div className='bg-neutral-800/50 border border-neutral-700 p-6 rounded-lg'>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Email:</strong>{' '}
                                    security@secpilot.com
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Subject:</strong> Security
                                    Inquiry
                                </p>
                                <p className='text-neutral-300'>
                                    <strong className='text-white'>Documentation:</strong>{' '}
                                    Additional security documentation available upon request
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
