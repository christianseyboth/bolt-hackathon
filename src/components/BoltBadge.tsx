'use client';

import React from 'react';
import Image from 'next/image';

export const BoltBadge = () => {
    return (
        <div className='fixed bottom-9 left-4 z-[9999] bg-white/10 backdrop-blur-sm rounded-lg p-2'>
            <a
                href='https://bolt.new/?rid=cqdahm'
                target='_blank'
                rel='noopener noreferrer'
                className='block transition-all duration-300 ease-in-out hover:scale-105'
            >
                <Image
                    src='https://storage.bolt.army/logotext_poweredby_360w.png'
                    alt='Powered by Bolt.new badge'
                    width={120}
                    height={32}
                    className='h-8 md:h-10 w-auto shadow-lg opacity-90 hover:opacity-100 transition-opacity duration-300'
                    priority
                />
            </a>
        </div>
    );
};
