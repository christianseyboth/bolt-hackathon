import React from 'react';
import { Container } from '../container';
import { Heading } from '../heading';
import { Subheading } from '../subheading';
import { FeatureIconContainer } from './feature-icon-container';
import { FaBolt, FaChartLine } from 'react-icons/fa';
import { IconShieldCheck, IconMail } from '@tabler/icons-react';
import { Card, CardDescription, CardSkeletonContainer, CardTitle } from './card';
import { SkeletonOne } from './skeletons/first';
import { SkeletonTwo } from './skeletons/second';
import { SkeletonThree } from './skeletons/third';
import { SkeletonFive } from './skeletons/fifth';

export const Features = () => {
    return (
        <div className='md:my-20 relative'>
            <Container className='py-20 max-w-5xl mx-auto relative z-40'>
                <FeatureIconContainer className='flex justify-center items-center overflow-hidden'>
                    <div className="relative">
                        <IconShieldCheck className='h-6 w-6 text-emerald-800' />
                    </div>
                </FeatureIconContainer>
                <Heading className='pt-4'>Enterprise-Grade Email Security for Small Business</Heading>
                <Subheading>
                    SecPilot delivers advanced email threat protection with AI-powered phishing detection,
                    malware scanning, and real-time security analytics. Get enterprise-level email security
                    without the enterprise cost - starting at $19/month with zero-storage privacy protection.
                </Subheading>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-2 py-10'>
                    <Card className='lg:col-span-2 '>
                        <CardTitle>Zero-Storage Privacy Protection & GDPR Compliance</CardTitle>
                        <CardDescription>
                            SecPilot analyzes your emails for security threats using advanced AI algorithms without storing
                            any personal data, email content, or sensitive information. SOC2 Type II certified with
                            HIPAA, GDPR, and PCI DSS compliance for healthcare, legal, and financial organizations.
                        </CardDescription>
                        <CardSkeletonContainer>
                            <SkeletonOne />
                        </CardSkeletonContainer>
                    </Card>
                    <Card className='lg:col-span-1'>
                        <CardSkeletonContainer className='max-w-[32rem] mx-auto'>
                            <SkeletonTwo />
                        </CardSkeletonContainer>
                        <CardTitle>Real-Time Threat Analytics & Security Reports</CardTitle>
                        <CardDescription>
                            Get comprehensive email security insights with real-time threat detection analytics,
                            executive security reports, and detailed threat intelligence. Track phishing attempts,
                            malware blocks, and security posture improvements with automated reporting.
                        </CardDescription>
                    </Card>

                    <Card>
                        <CardSkeletonContainer showGradient={false}
                            className='max-w-[16rem] mx-auto bg-[rgba(40,40,40,0.30)] [mask-image:radial-gradient(80%_80%_at_50%_50%,white_0%,transparent_100%)]'>
                            <SkeletonFive />
                        </CardSkeletonContainer>
                        <CardTitle>Global Email Security Intelligence Network</CardTitle>
                        <CardDescription>
                            SecPilot analyzes email threats from 50+ countries using machine learning models trained on
                            global attack patterns. Our threat intelligence network processes millions of emails daily
                            to detect emerging phishing campaigns, malware variants, and zero-day email attacks.
                        </CardDescription>
                    </Card>
                    <Card className='lg:col-span-2'>
                        <CardSkeletonContainer>
                            <SkeletonThree />
                        </CardSkeletonContainer>
                        <CardTitle>AI-Powered Email Security with 99.9% Accuracy</CardTitle>
                        <CardDescription>
                            Advanced machine learning algorithms analyze email content, sender reputation, URLs, and attachments
                            with 99.9% accuracy. Detect sophisticated business email compromise (BEC), CEO fraud, vendor
                            impersonation, and advanced persistent threats that bypass traditional email filters.
                        </CardDescription>
                    </Card>
                </div>
            </Container>
        </div>
    );
};

