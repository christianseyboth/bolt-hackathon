'use client';
import React, { useRef, useEffect, useState } from 'react';

export const StickyScroll = ({
    content,
}: {
    content: {
        title: string;
        description: string;
        icon?: React.ReactNode;
        content?: React.ReactNode;
    }[];
}) => {
    return (
        <div className='py-4 md:py-20' style={{ position: 'relative' }}>
            <div className='hidden lg:flex h-full flex-col max-w-7xl mx-auto justify-between relative p-10'>
                {content.map((item, index) => (
                    <ScrollContent key={item.title + index} item={item} index={index} />
                ))}
            </div>
            <div className='flex lg:hidden flex-col max-w-7xl mx-auto justify-between relative p-10'>
                {content.map((item, index) => (
                    <ScrollContentMobile key={item.title + index} item={item} index={index} />
                ))}
            </div>
        </div>
    );
};

export const ScrollContent = ({
    item,
    index,
}: {
    item: {
        title: string;
        description: string;
        icon?: React.ReactNode;
        content?: React.ReactNode;
    };
    index: number;
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || typeof window === 'undefined') return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [mounted]);

    return (
        <div
            ref={ref}
            className={`my-40 relative grid grid-cols-3 gap-8 transition-all duration-700 ${
                mounted && isVisible
                    ? 'opacity-100 transform translate-y-0'
                    : 'opacity-50 transform translate-y-10'
            }`}
            style={{ position: 'relative' }}
            suppressHydrationWarning
        >
            <div className='w-full'>
                <div className=''>
                    <div>{item.icon}</div>
                    <h2 className='mt-2 font-bold text-2xl lg:text-4xl inline-block bg-clip-text text-left text-transparent bg-gradient-to-b from-white to-white'>
                        {item.title}
                    </h2>
                    <p className='text-lg text-neutral-500 font-bold max-w-sm mt-2'>
                        {item.description}
                    </p>
                </div>
            </div>

            <div className='h-full w-full rounded-md self-start col-span-2'>
                {item.content && item.content}
            </div>
        </div>
    );
};

export const ScrollContentMobile = ({
    item,
    index,
}: {
    item: {
        title: string;
        description: string;
        icon?: React.ReactNode;
        content?: React.ReactNode;
    };
    index: number;
}) => {
    return (
        <div
            className='my-10 relative flex flex-col md:flex-row md:space-x-4'
            style={{ position: 'relative' }}
        >
            <div className='w-full'>
                <div className='mb-6'>
                    <div>{item.icon}</div>
                    <h2 className='mt-2 font-bold text-2xl lg:text-4xl inline-block bg-clip-text text-left text-transparent bg-gradient-to-b from-white to-white'>
                        {item.title}
                    </h2>
                    <p className='text-sm md:text-base text-neutral-500 font-bold max-w-sm mt-2'>
                        {item.description}
                    </p>
                </div>
            </div>

            <div className='w-full rounded-md self-start'>{item.content && item.content}</div>
        </div>
    );
};
