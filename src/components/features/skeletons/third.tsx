// src/components/features/skeletons/third.tsx
'use client';
import React from 'react';

export const SkeletonThree = () => {
    return (
        <div className='relative flex py-8 px-2 gap-10 h-full'>
            <div className='w-full mx-auto bg-neutral-900 shadow-2xl group h-full rounded-lg p-6'>
                <div className='grid grid-cols-3 gap-4 h-full'>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className='bg-neutral-800 rounded-lg p-4 space-y-2'>
                            <div className='h-3 w-full bg-purple-500/50 rounded animate-pulse'></div>
                            <div className='h-2 w-3/4 bg-neutral-600 rounded animate-pulse'></div>
                            <div className='h-2 w-1/2 bg-neutral-600 rounded animate-pulse'></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
