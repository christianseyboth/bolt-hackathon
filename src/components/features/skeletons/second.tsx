// src/components/features/skeletons/second.tsx
'use client';
import React from 'react';

export const SkeletonTwo = () => {
    return (
        <div className='relative flex flex-col items-start p-8 gap-4 h-full'>
            <div className='flex flex-col gap-2 w-full'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className='flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg'
                    >
                        <div className='w-3 h-3 bg-blue-500 rounded-full animate-pulse'></div>
                        <div className='h-2 flex-1 bg-neutral-600 rounded animate-pulse'></div>
                        <div className='h-2 w-8 bg-neutral-600 rounded animate-pulse'></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
