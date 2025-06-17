// src/components/features/skeletons/fifth.tsx
'use client';
import React from 'react';

export const SkeletonFive = () => {
    return (
        <div className='relative flex flex-col items-center justify-center p-8 h-full'>
            <div className='w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full mb-4 animate-pulse'></div>
            <div className='space-y-2 w-full'>
                <div className='h-2 w-3/4 bg-neutral-600 rounded mx-auto animate-pulse'></div>
                <div className='h-2 w-1/2 bg-neutral-600 rounded mx-auto animate-pulse'></div>
            </div>
        </div>
    );
};
