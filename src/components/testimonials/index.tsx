import React from 'react';
import { TestimonialsSlider } from './Slider';
import { FeatureIconContainer } from '../features/FeatureIconContainer';
import { Heading } from '../Heading';
import { Subheading } from '../Subheading';
import { TbLocationBolt } from 'react-icons/tb';


const TrustIndicators = () => {
    const stats = [
        { label: 'Users Protected', value: '50,000+' },
        { label: 'Threats Blocked', value: '2.3M+' },
        { label: 'Countries Served', value: '50+' },
        { label: 'Uptime', value: '99.9%' },
    ];

    return (
        <div className='max-w-4xl mx-auto'>
            <div className='text-center mb-8'>
                <h3 className='text-lg font-semibold text-neutral-300 mb-2'>Trusted Globally</h3>
                <p className='text-sm text-neutral-500'>
                    Join thousands of individuals and organizations protecting their email
                    communications
                </p>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                {stats.map((stat, index) => (
                    <div key={index} className='text-center'>
                        <div className='text-2xl md:text-3xl font-bold text-emerald-400 mb-1'>
                            {stat.value}
                        </div>
                        <div className='text-sm text-neutral-400'>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Company logos placeholder */}
        </div>
    );
};

export const Testimonials = () => {
    return (
        <div className='relative mt-8'>
            <div className='pb-20'>
                <FeatureIconContainer className='flex justify-center items-center overflow-hidden'>
                    <div className='relative'>
                        <TbLocationBolt className='h-5 w-5 text-emerald-800 ' />
                    </div>
                </FeatureIconContainer>
                <Heading className='pt-4'>Trusted by thousands worldwide</Heading>
                <Subheading>
                    From individual freelancers to enterprise security teams, SecPilot protects
                    email communications for users across 50+ countries.
                </Subheading>
            </div>

            <div className='py-20 relative'>
                {/* Simplified background with subtle pattern */}
                <div className='absolute inset-0 h-full w-full opacity-10'>
                    <div className='absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10'></div>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.1)_0%,transparent_25%)] bg-[length:100px_100px]'></div>
                </div>

                {/* Main testimonials slider */}
                <TestimonialsSlider />

                {/* Trust indicators */}
                <div className='mt-16 relative z-10'>
                    <TrustIndicators />
                </div>
            </div>
        </div>
    );
};
