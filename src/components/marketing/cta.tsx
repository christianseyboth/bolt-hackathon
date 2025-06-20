import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/button';
import { Container } from '@/components/container';
import { IconShield, IconCheck, IconArrowRight, IconMail, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';

export const CTA = () => {
    return (
        <div className='relative py-20 sm:py-32'>
            <Container className='text-center'>
                <div className='max-w-5xl mx-auto'>
                    {/* Main Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className='mb-8'
                    >
                        <h2 className='text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight'>
                            Protect Your Business from Email Threats
                        </h2>
                        <p className='text-lg md:text-xl text-neutral-400 mb-8 max-w-3xl mx-auto leading-relaxed'>
                            Stop phishing, malware, and ransomware attacks before they reach your
                            inbox. Join thousands of businesses protecting their communications with
                            AI-powered security.
                        </p>
                    </motion.div>

                    {/* Social Proof Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className='grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-12 max-w-4xl mx-auto'
                    >
                        <div className='flex flex-col items-center p-4'>
                            <div className='flex items-center justify-center w-12 h-12 bg-emerald-500/20 rounded-full mb-3'>
                                <IconShield className='h-6 w-6 text-emerald-400' />
                            </div>
                            <div className='text-2xl md:text-3xl font-bold text-white mb-1'>
                                99.9%
                            </div>
                            <div className='text-sm text-neutral-400'>Threat Detection Rate</div>
                        </div>
                        <div className='flex flex-col items-center p-4'>
                            <div className='flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-3'>
                                <IconUsers className='h-6 w-6 text-blue-400' />
                            </div>
                            <div className='text-2xl md:text-3xl font-bold text-white mb-1'>
                                10,000+
                            </div>
                            <div className='text-sm text-neutral-400'>Protected Individuals</div>
                        </div>
                        <div className='flex flex-col items-center p-4'>
                            <div className='flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-3'>
                                <IconMail className='h-6 w-6 text-purple-400' />
                            </div>
                            <div className='text-2xl md:text-3xl font-bold text-white mb-1'>
                                5M+
                            </div>
                            <div className='text-sm text-neutral-400'>Emails Secured Yearly</div>
                        </div>
                    </motion.div>

                    {/* Key Benefits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto'
                    >
                        <div className='flex items-center space-x-3 p-3 sm:flex-row flex-col'>
                            <IconCheck className='h-5 w-5 text-emerald-400 flex-shrink-0' />
                            <span className='text-neutral-300'>Setup in under 5 minutes</span>
                        </div>
                        <div className='flex items-center space-x-3 p-3 sm:flex-row flex-col'>
                            <IconCheck className='h-5 w-5 text-emerald-400 flex-shrink-0' />
                            <span className='text-neutral-300'>Works with Gmail & Outlook</span>
                        </div>
                        <div className='flex items-center space-x-3 p-3 sm:flex-row flex-col'>
                            <IconCheck className='h-5 w-5 text-emerald-400 flex-shrink-0' />
                            <span className='text-neutral-300'>Zero-storage privacy model</span>
                        </div>
                        <div className='flex items-center space-x-3 p-3 sm:flex-row flex-col'>
                            <IconCheck className='h-5 w-5 text-emerald-400 flex-shrink-0' />
                            <span className='text-neutral-300'>24/7 threat monitoring</span>
                        </div>
                    </motion.div>

                    {/* Call-to-Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                        className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-8'
                    >
                        <Link href='/register'>
                            <Button size='lg' className='flex items-center group'>
                                <span>Start Free Trial</span>
                                <IconArrowRight className='h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200' />
                            </Button>
                        </Link>
                        <Link href='/pricing'>
                            <Button size='lg' variant='muted'>
                                View Pricing Plans
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Trust Badge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        viewport={{ once: true }}
                        className='text-center'
                    >
                        <p className='text-sm text-neutral-500 mb-2'>
                            Trusted by businesses worldwide
                        </p>
                        <div className='flex flex-wrap justify-center items-center gap-6 opacity-60'>
                            <div className='text-xs text-neutral-600 bg-neutral-800/30 px-3 py-1 rounded-full'>
                                SOC 2 Compliant
                            </div>
                            <div className='text-xs text-neutral-600 bg-neutral-800/30 px-3 py-1 rounded-full'>
                                GDPR Ready
                            </div>
                            <div className='text-xs text-neutral-600 bg-neutral-800/30 px-3 py-1 rounded-full'>
                                ISO 27001
                            </div>
                            <div className='text-xs text-neutral-600 bg-neutral-800/30 px-3 py-1 rounded-full'>
                                HIPAA Compatible
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Container>

            {/* Background Elements */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl' />
                <div className='absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl' />
            </div>
        </div>
    );
};
