import { cn } from '@/lib/utils';
import React from 'react';

export const FeatureIconContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className='[perspective:400px] [transform-style:preserve-3d]'>
            <div
                className={cn(
                    'h-14 w-14 p-[4px] rounded-md bg-gradient-to-b from-neutral-800 to-neutral-950 mx-auto relative'
                )}
                style={{
                    transform: 'rotateX(25deg)',
                    transformOrigin: 'center',
                }}
            >
                <div
                    className={cn(
                        'bg-charcoal rounded-[5px] h-full w-full relative z-20 flex items-center justify-center',
                        className
                    )}
                >
                    <div className="relative">
                        {/* Icon glow effect - only around the icon */}
                        <div
                            className="absolute inset-0 animate-pulse"
                            style={{
                                filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6)) drop-shadow(0 0 16px rgba(16, 185, 129, 0.4))',
                            }}
                        >
                            {children}
                        </div>
                        {/* Actual icon */}
                        <div className="relative z-10">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Subtle bottom accent effects */}
                <div className='absolute bottom-0 inset-x-0 bg-neutral-600 opacity-50 rounded-full blur-lg h-4 w-full mx-auto z-30'></div>
                <div className='absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent h-px w-[60%] mx-auto'></div>
                <div className='absolute bottom-0 inset-x-0 bg-gradient-to-r from-transparent via-emerald-600/40 blur-sm to-transparent h-[8px] w-[60%] mx-auto'></div>
            </div>
        </div>
    );
};

