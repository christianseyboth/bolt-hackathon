// src/components/features/skeletons/first.tsx
'use client';
import React from 'react';

export const SkeletonOne = () => {
    return (
        <div className='relative flex py-8 px-2 gap-10 h-full'>
            <div className='w-full p-5 mx-auto bg-neutral-900 shadow-2xl group h-full'>
                <div className='flex flex-1 w-full h-full flex-col space-y-2'>
                    {/* Header */}
                    <div className='h-4 w-3/4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-md animate-pulse'></div>

                    {/* Content rows */}
                    <div className='h-3 w-full bg-neutral-700 rounded-md animate-pulse'></div>
                    <div className='h-3 w-5/6 bg-neutral-700 rounded-md animate-pulse'></div>
                    <div className='h-3 w-4/5 bg-neutral-700 rounded-md animate-pulse'></div>

                    {/* Status indicators */}
                    <div className='flex gap-2 mt-4'>
                        <div className='h-2 w-2 bg-emerald-500 rounded-full animate-pulse'></div>
                        <div className='h-2 w-16 bg-emerald-500/50 rounded-md animate-pulse'></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
