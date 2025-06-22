'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { IconUsers, IconBriefcase, IconHome } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface TrustIndicator {
    icon: React.ReactNode;
    label: string;
    stat: string;
    description: string;
}

const trustIndicators: TrustIndicator[] = [
    {
        icon: <IconHome className='h-5 w-5' />,
        label: 'Remote Workers',
        stat: '15,000+',
        description: 'Working from home safely',
    },
    {
        icon: <IconUsers className='h-5 w-5' />,
        label: 'Freelancers',
        stat: '8,500+',
        description: 'Protecting client data',
    },
    {
        icon: <IconBriefcase className='h-5 w-5' />,
        label: 'Small Businesses',
        stat: '2,300+',
        description: 'Enterprise-grade protection',
    },
];

export const FeaturedImages = ({
    className: containerClassName,
    textClassName,
    showStars = false,
}: {
    className?: string;
    textClassName?: string;
    showStars?: boolean;
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={cn('flex flex-col items-center mt-10 mb-10', containerClassName)}>
            {/* Target audience indicators */}
            <div className='mb-6' suppressHydrationWarning>
                <div className='flex flex-wrap justify-center gap-4 max-w-2xl mx-auto'>
                    {trustIndicators.map((indicator, index) =>
                        mounted ? (
                            <motion.div
                                key={indicator.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.1,
                                    duration: 0.4,
                                    ease: 'easeOut',
                                }}
                                className='group bg-neutral-900/30 border border-neutral-800 rounded-lg p-3 min-w-[140px] hover:border-emerald-500/30 transition-all duration-200'
                            >
                                <div className='flex items-center gap-2 mb-1'>
                                    <div className='p-1 rounded bg-emerald-500/10 text-emerald-400'>
                                        {indicator.icon}
                                    </div>
                                    <div className='text-lg font-bold text-emerald-400'>
                                        {indicator.stat}
                                    </div>
                                </div>
                                <div className='text-sm font-medium text-neutral-200 mb-1'>
                                    {indicator.label}
                                </div>
                                <div className='text-xs text-neutral-400'>
                                    {indicator.description}
                                </div>
                            </motion.div>
                        ) : (
                            // Server-rendered version - static content visible to crawlers
                            <div
                                key={indicator.label}
                                className='group bg-neutral-900/30 border border-neutral-800 rounded-lg p-3 min-w-[140px] hover:border-emerald-500/30 transition-all duration-200'
                            >
                                <div className='flex items-center gap-2 mb-1'>
                                    <div className='p-1 rounded bg-emerald-500/10 text-emerald-400'>
                                        {indicator.icon}
                                    </div>
                                    <div className='text-lg font-bold text-emerald-400'>
                                        {indicator.stat}
                                    </div>
                                </div>
                                <div className='text-sm font-medium text-neutral-200 mb-1'>
                                    {indicator.label}
                                </div>
                                <div className='text-xs text-neutral-400'>
                                    {indicator.description}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Simple value proposition */}
            {showStars && (
                <div className='flex flex-col items-center mb-4' suppressHydrationWarning>
                    {mounted ? (
                        <motion.div
                            className='flex items-center gap-1 mb-2'
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                        >
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className='text-yellow-400 text-lg'>
                                    ★
                                </span>
                            ))}
                        </motion.div>
                    ) : (
                        <div className='flex items-center gap-1 mb-2'>
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className='text-yellow-400 text-lg'>
                                    ★
                                </span>
                            ))}
                        </div>
                    )}
                    <p
                        className={cn(
                            'text-neutral-400 text-sm text-center max-w-xl mx-auto relative z-40',
                            textClassName
                        )}
                    >
                        Trusted by security professionals worldwide
                        <span className='text-xs mt-1 block text-neutral-500'>
                            4.9/5 stars from verified customers
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};
