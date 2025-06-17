'use client';
import React from 'react';
import { Button } from '@/components/button';
import { Container } from '@/components/container';
import { IconShield, IconBolt, IconUsers, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';

export const CTA = () => {
    return (
        <div className='relative py-20 sm:py-40'>
            <Container className='text-center'>
                <div className='max-w-4xl mx-auto'>
                    <h2 className='text-white text-3xl md:text-5xl font-bold mb-6'>
                        Stop Email Attacks Before They Cost Your Business
                    </h2>
                    <p className='text-lg md:text-xl text-neutral-400 mb-8 max-w-2xl mx-auto'>
                        Join 10,000+ businesses using SecPilot's AI-powered email security to
                        prevent phishing, malware, and ransomware attacks. 99.9% accuracy,
                        zero-storage privacy, and seamless integration with Gmail, Outlook, and
                        Office 365. Start your free trial today.
                    </p>

                    {/* Pricing Preview */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto'>
                        <div className='border border-neutral-800 rounded-lg p-6 bg-neutral-900/50'>
                            <div className='flex items-center justify-center mb-4'>
                                <IconBolt className='h-6 w-6 text-blue-400' />
                            </div>
                            <h3 className='text-xl font-semibold mb-2'>Solo</h3>
                            <div className='text-3xl font-bold mb-2'>
                                $19<span className='text-sm text-neutral-400'>/mo</span>
                            </div>
                            <p className='text-neutral-400 text-sm'>
                                Perfect for individual professionals
                            </p>
                        </div>

                        <div className='border border-blue-500 rounded-lg p-6 bg-blue-500/5 relative'>
                            <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                                <span className='bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium'>
                                    Most Popular
                                </span>
                            </div>
                            <div className='flex items-center justify-center mb-4'>
                                <IconUsers className='h-6 w-6 text-purple-400' />
                            </div>
                            <h3 className='text-xl font-semibold mb-2'>Entrepreneur</h3>
                            <div className='text-3xl font-bold mb-2'>
                                $49<span className='text-sm text-neutral-400'>/mo</span>
                            </div>
                            <p className='text-neutral-400 text-sm'>Ideal for growing businesses</p>
                        </div>

                        <div className='border border-neutral-800 rounded-lg p-6 bg-neutral-900/50'>
                            <div className='flex items-center justify-center mb-4'>
                                <IconShield className='h-6 w-6 text-emerald-400' />
                            </div>
                            <h3 className='text-xl font-semibold mb-2'>Team</h3>
                            <div className='text-3xl font-bold mb-2'>
                                $99<span className='text-sm text-neutral-400'>/mo</span>
                            </div>
                            <p className='text-neutral-400 text-sm'>Advanced features for teams</p>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                        <Link href='/pricing'>
                            <Button className='flex items-center group !text-lg px-8 py-3'>
                                <span>View All Plans</span>
                                <IconArrowRight className='h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200' />
                            </Button>
                        </Link>
                        <Link href='/dashboard'>
                            <Button variant='outline' className='!text-lg px-8 py-3'>
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
};
