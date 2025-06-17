'use client';

import React, { useState, useEffect } from 'react';
import { GridPattern } from './grid-pattern';

export const Grid = ({ pattern, size }: { pattern?: number[][]; size?: number }) => {
    const [mounted, setMounted] = useState(false);

    // Fixed deterministic pattern to avoid hydration issues
    const defaultPattern = [
        [9, 2],
        [8, 3],
        [10, 1],
        [7, 4],
        [9, 5],
    ];

    const p = pattern ?? defaultPattern;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render on server to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <div className='pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]'>
            <div className='absolute inset-0 bg-gradient-to-r  [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] from-zinc-900/30 to-zinc-900/30 opacity-100'>
                <GridPattern
                    width={size ?? 20}
                    height={size ?? 20}
                    x='-12'
                    y='4'
                    squares={p}
                    className='absolute inset-0 h-full w-full  mix-blend-overlay fill-white/10 stroke-white/10'
                />
            </div>
        </div>
    );
};

