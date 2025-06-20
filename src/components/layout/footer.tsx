'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Logo } from '@/components/logo';
import {
    IconMail,
    IconShieldCheck,
    IconBolt,
    IconBrandTwitter,
    IconBrandLinkedin,
    IconBrandGithub,
    IconBrandYoutube,
    IconCheck,
    IconLoader2,
} from '@tabler/icons-react';

export const Footer = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [error, setError] = useState('');

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isLoading) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to subscribe');
            }

            setIsSubscribed(true);
            setEmail('');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const productLinks = [
        {
            name: 'Pricing',
            href: '/pricing',
        },
        {
            name: 'Features',
            href: '/#features',
        },
    ];

    const companyLinks = [
        {
            name: 'About',
            href: '/about',
        },
        {
            name: 'Contact',
            href: '/contact',
        },
    ];

    const legalLinks = [
        {
            name: 'Privacy Policy',
            href: '/privacy',
        },
        {
            name: 'Terms of Service',
            href: '/terms',
        },
        {
            name: 'Security Policy',
            href: '/security-policy',
        },
        {
            name: 'GDPR',
            href: '/gdpr',
        },
    ];

    const socialLinks = [
        {
            name: 'YouTube',
            href: 'https://www.youtube.com/@secpilot',
            icon: <IconBrandYoutube className='h-5 w-5' />,
        },
        {
            name: 'LinkedIn',
            href: 'https://www.linkedin.com/in/christianseyboth/',
            icon: <IconBrandLinkedin className='h-5 w-5' />,
        },
        {
            name: 'GitHub',
            href: 'https://github.com/christianseyboth',
            icon: <IconBrandGithub className='h-5 w-5' />,
        },
    ];

    return (
        <footer className='relative bg-neutral-950 border-t border-neutral-800'>
            {/* Gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent pointer-events-none' />

            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Main footer content */}
                <div className='py-16 lg:py-20'>
                    <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12'>
                        {/* Brand section */}
                        <div className='lg:col-span-2'>
                            <div className='flex items-center space-x-3 mb-6'>
                                <Logo />
                            </div>
                            <p className='text-neutral-400 text-sm leading-relaxed mb-6 max-w-md'>
                                Advanced AI-powered email security that protects your organization
                                from sophisticated threats. Real-time detection, automated response,
                                and comprehensive compliance.
                            </p>

                            {/* Trust badges */}
                            <div className='flex items-center space-x-6 mb-6'>
                                <div className='flex items-center space-x-2 text-xs text-neutral-500'>
                                    <IconShieldCheck className='h-4 w-4 text-emerald-400' />
                                    <span>SOC2 Ready</span>
                                </div>
                                <div className='flex items-center space-x-2 text-xs text-neutral-500'>
                                    <IconShieldCheck className='h-4 w-4 text-blue-400' />
                                    <span>HIPAA Ready</span>
                                </div>
                            </div>

                            {/* Social links */}
                            <div className='flex items-center space-x-4'>
                                {socialLinks.map((social) => (
                                    <Link
                                        key={social.name}
                                        href={social.href}
                                        className='text-neutral-500 hover:text-white transition-colors duration-200 p-2 hover:bg-neutral-800 rounded-lg'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        {social.icon}
                                        <span className='sr-only'>{social.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Product links */}
                        <div>
                            <h3 className='text-white font-semibold text-sm mb-4'>Product</h3>
                            <ul className='space-y-3'>
                                {productLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className='text-neutral-400 hover:text-white transition-colors duration-200 text-sm'
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company links */}
                        <div>
                            <h3 className='text-white font-semibold text-sm mb-4'>Company</h3>
                            <ul className='space-y-3'>
                                {companyLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className='text-neutral-400 hover:text-white transition-colors duration-200 text-sm'
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal links */}
                        <div>
                            <h3 className='text-white font-semibold text-sm mb-4'>Legal</h3>
                            <ul className='space-y-3'>
                                {legalLinks.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className='text-neutral-400 hover:text-white transition-colors duration-200 text-sm'
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Newsletter signup - Updated section */}
                <div className='border-t border-neutral-800 py-8'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
                        <div className='mb-4 lg:mb-0'>
                            <h3 className='text-white font-semibold text-sm mb-2'>
                                Stay updated on security threats
                            </h3>
                            <p className='text-neutral-400 text-sm'>
                                Get weekly insights on email security trends and threat
                                intelligence.
                            </p>
                        </div>

                        {isSubscribed ? (
                            <div className='flex items-center space-x-2 text-emerald-400'>
                                <IconCheck className='h-5 w-5' />
                                <span className='text-sm font-medium'>
                                    Successfully subscribed!
                                </span>
                            </div>
                        ) : (
                            <form onSubmit={handleNewsletterSubmit} className='flex space-x-3'>
                                <div className='flex-1 lg:w-64'>
                                    <input
                                        type='email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder='Enter your email'
                                        className='w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        required
                                        disabled={isLoading}
                                    />
                                    {error && <p className='text-red-400 text-xs mt-1'>{error}</p>}
                                </div>
                                <button
                                    type='submit'
                                    disabled={isLoading || !email}
                                    className='bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap flex items-center space-x-2 cursor-pointer'
                                >
                                    {isLoading ? (
                                        <>
                                            <IconLoader2 className='h-4 w-4 animate-spin' />
                                            <span>Subscribing...</span>
                                        </>
                                    ) : (
                                        <span>Subscribe</span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Bottom section */}
                <div className='border-t border-neutral-800 py-6'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                        <div className='text-neutral-500 text-xs mb-4 sm:mb-0'>
                            © {new Date().getFullYear()} SecPilot Inc. All rights reserved.
                        </div>
                        <div className='flex items-center space-x-6 text-xs text-neutral-500'>
                            <div className='flex items-center space-x-1'>
                                <IconBolt className='h-3 w-3 text-emerald-400' />
                                <span>99.9% Uptime</span>
                            </div>
                            <div className='flex items-center space-x-1'>
                                <IconMail className='h-3 w-3 text-blue-400' />
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
