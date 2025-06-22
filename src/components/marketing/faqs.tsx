'use client';
import React, { useState, useEffect } from 'react';
import Accordion from '@/components/Accordion';
import { Heading } from '@/components/Heading';
import { Subheading } from '@/components/Subheading';
import { Container } from '@/components/Container';
import { FeatureIconContainer } from '@/components/features/FeatureIconContainer';
import { IconHelp } from '@tabler/icons-react';
import Link from 'next/link';

const questions = [
    {
        id: 1,
        title: 'What is email security software and how does SecPilot protect against phishing attacks?',
        description:
            'Email security software like SecPilot uses advanced AI and machine learning algorithms to detect and prevent phishing attacks, malware, ransomware, and business email compromise (BEC) attempts. SecPilot analyzes email content, sender reputation, links, and attachments in real-time without storing your data, providing enterprise-grade protection for individuals, small businesses, and remote teams.',
    },
    {
        id: 2,
        title: 'How much does email security cost for small businesses in 2024?',
        description:
            "SecPilot's email security pricing starts at $9/month for individual users, $19/month for small business teams (up to 10 users), and $49/month for growing companies (up to 50 users). This includes real-time threat detection, phishing protection, malware scanning, detailed security reports, and 24/7 support. Most small businesses save $50,000+ annually by preventing just one successful email attack.",
    },
    {
        id: 3,
        title: "What's the difference between SecPilot and Microsoft Defender or Gmail security?",
        description:
            'While Microsoft Defender and Gmail provide basic email filtering, SecPilot offers advanced AI-powered threat detection with 99.9% accuracy rates, zero-storage privacy protection, and specialized small business features. SecPilot detects sophisticated attacks that bypass default email security, including targeted spear phishing, CEO fraud, and zero-day threats that traditional email providers often miss.',
    },
    {
        id: 4,
        title: 'How quickly can email security software detect and stop cyber attacks?',
        description:
            'SecPilot provides real-time email security with threat detection and response times under 200 milliseconds. Malicious emails are quarantined instantly before reaching your inbox. Our AI processes over 1 million threat indicators per second, analyzing URLs, attachments, sender behavior, and content patterns to stop attacks including ransomware, credential theft, and financial fraud attempts.',
    },
    {
        id: 5,
        title: 'Does SecPilot email security work with Gmail, Outlook, and Office 365?',
        description:
            'Yes, SecPilot integrates seamlessly with all major email providers including Gmail (Google Workspace), Microsoft Outlook, Office 365, Exchange Server, Yahoo Mail, and IMAP/POP3 email clients. Setup takes 5 minutes through secure API integration without changing your email workflow. Works on desktop, mobile, and web applications across Windows, Mac, iOS, and Android devices.',
    },
    {
        id: 6,
        title: 'What happens if email security software blocks legitimate business emails?',
        description:
            'SecPilot maintains a 99.9% accuracy rate with minimal false positives. If a legitimate email is mistakenly quarantined, you can instantly release it, whitelist the sender, and add trusted domains to your allow list. All quarantined emails are safely stored for 30 days with detailed explanations of why they were flagged, ensuring no important business communications are permanently lost.',
    },
    {
        id: 7,
        title: 'Is cloud-based email security safe for sensitive business data and HIPAA compliance?',
        description:
            'SecPilot uses zero-storage architecture, meaning your email content never leaves your servers. We only analyze emails in real-time transit without storing any sensitive data. Our infrastructure is SOC2 Type II certified, uses end-to-end encryption, and meets HIPAA, GDPR, and PCI DSS compliance requirements. Perfect for healthcare, legal, financial, and other regulated industries requiring strict data protection.',
    },
    {
        id: 8,
        title: 'What kind of customer support comes with business email security solutions?',
        description:
            'SecPilot provides 24/7 email and chat support for all plans, with phone support for team and enterprise customers. Our security experts help with threat analysis, false positive resolution, integration support, and security best practices. We also offer comprehensive onboarding, video tutorials, knowledge base access, and dedicated customer success managers for larger accounts.',
    },
    {
        id: 9,
        title: 'Can I try enterprise email security software free before purchasing?',
        description:
            'Yes, SecPilot offers a 14-day free trial with full access to all email security features including real-time threat detection, detailed reporting, and customer support. No credit card required to start your trial. You can protect up to 5 email accounts during the trial period and see exactly how many threats we block for your organization before making a purchasing decision.',
    },
    {
        id: 10,
        title: "How secure is SecPilot's email security infrastructure against data breaches?",
        description:
            "SecPilot operates with enterprise-grade security including AES-256 encryption, zero-trust network architecture, regular third-party security audits, and SOC2 Type II compliance. Our infrastructure is hosted on AWS and Google Cloud with 99.99% uptime SLA, DDoS protection, and geographically distributed data centers. We've maintained a perfect security record with zero data breaches since our founding, protecting over 100,000 email accounts globally.",
    },
    {
        id: 11,
        title: 'What types of email threats can AI-powered security detect that traditional filters miss?',
        description:
            "SecPilot's AI detects advanced persistent threats (APTs), business email compromise (BEC), CEO fraud, vendor impersonation, cryptocurrency scams, romance scams, tax fraud emails, fake invoice attacks, credential harvesting, and zero-day malware that signature-based filters can't catch. Our machine learning models analyze behavioral patterns, linguistic anomalies, and threat intelligence from 50+ countries to stop sophisticated social engineering attacks.",
    },
    {
        id: 12,
        title: 'How does email security help prevent ransomware attacks on small businesses?',
        description:
            "Email is the #1 attack vector for ransomware, with 94% of ransomware delivered via email attachments or malicious links. SecPilot prevents ransomware by scanning all attachments with multiple anti-malware engines, analyzing URLs in real-time, detecting suspicious sender behavior, and quarantining emails with ransomware indicators. We've prevented over $50 million in potential ransomware damages for our customers since 2020.",
    },
];

export const FAQs = () => {
    const [expanded, setExpanded] = useState<number | false>(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className='relative py-20'>
            <Container className='max-w-4xl mx-auto'>
                {/* Header */}
                <div className='text-center mb-16'>
                    <FeatureIconContainer className='flex justify-center items-center overflow-hidden mx-auto'>
                        <div className='relative'>
                            <IconHelp className='h-6 w-6 text-emerald-800' />
                        </div>
                    </FeatureIconContainer>
                    <Heading className='pt-4'>
                        Email Security FAQ: Everything You Need to Know
                    </Heading>
                    <Subheading className='max-w-2xl mx-auto'>
                        Get expert answers about email security software, pricing, features, and how
                        SecPilot protects businesses from phishing, ransomware, and cyber attacks in
                        2024.
                    </Subheading>
                </div>

                {/* FAQ Grid */}
                <div className='space-y-4' suppressHydrationWarning>
                    {questions.map((item, i) =>
                        mounted ? (
                            <Accordion
                                key={i}
                                i={i}
                                expanded={expanded}
                                setExpanded={setExpanded}
                                title={item.title}
                                description={item.description}
                            />
                        ) : (
                            // Server-rendered version - all content visible for crawlers
                            <div
                                key={i}
                                className='border border-neutral-800 rounded-xl bg-neutral-900/30 overflow-hidden transition-all duration-300 hover:border-emerald-500/30'
                            >
                                <div className='p-6'>
                                    <h3 className='text-white text-base font-semibold mb-4 pr-4'>
                                        {item.title}
                                    </h3>
                                    <p className='text-sm font-normal text-neutral-400 leading-relaxed'>
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>

                {/* Contact CTA */}
                <div className='mt-16 text-center p-8 bg-neutral-900/30 border border-neutral-800 rounded-xl'>
                    <h3 className='text-lg font-semibold text-white mb-2'>
                        Need Expert Email Security Advice?
                    </h3>
                    <p className='text-neutral-400 text-sm mb-4'>
                        Our cybersecurity experts are here to help you choose the right email
                        protection for your business size and industry requirements.
                    </p>
                    <div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
                        <Link
                            href='contact'
                            className='px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors duration-200'
                        >
                            Get Security Consultation
                        </Link>
                        <Link
                            href='/contact'
                            className='px-6 py-2 border border-neutral-700 hover:border-emerald-500/50 text-neutral-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200'
                        >
                            Request Demo
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
};
