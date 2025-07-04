﻿'use client';
import React, { useRef, useState, useEffect } from 'react';
import { MotionValue, motion, useScroll, useTransform } from 'motion/react';
import { Button } from '@/components/Button';
import { HiArrowRight } from 'react-icons/hi2';
import Image from 'next/image';
import { Container } from '@/components/Container';
import { Heading } from '@/components/Heading';
import { Subheading } from '@/components/Subheading';
import { FeaturedImages } from '@/components/FeaturedImages';
import Beam from '@/components/beam';
import Link from 'next/link';
import { LazyVideoModal } from '@/components/LazyComponents';

export const Hero = () => {
    const containerRef = useRef<any>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
    });
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const scaleDimensions = () => {
        return isMobile ? [0.7, 0.9] : [1.05, 1.2];
    };

    const rotate = useTransform(scrollYProgress, [0, 0.5], [20, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
    const translate = useTransform(scrollYProgress, [0, 1], [0, 100]);

    return (
        <section
            ref={containerRef}
            className='flex flex-col min-h-[70rem] md:min-h-[100rem] pt-20 md:pt-40 relative overflow-hidden'
            aria-labelledby='hero-heading'
        >
            <Container className='flex flex-col items-center justify-center'>
                <Heading
                    as='h1'
                    id='hero-heading'
                    className='text-4xl md:text-4xl lg:text-8xl font-semibold max-w-6xl mx-auto text-center mt-6 relative z-10 py-6'
                >
                    Never Lose Money to Email Attacks Again
                </Heading>
                <Subheading className='text-center mt-2 md:mt-6 text-base md:text-xl text-muted dark:text-white max-w-3xl mx-auto relative z-10'>
                    Advanced AI-powered email security software that detects phishing, malware,
                    ransomware, and business email compromise (BEC) attacks in real-time. Protect
                    your organization with 99.9% accurate threat detection that works with Gmail,
                    Outlook, and Office 365.
                </Subheading>
                <FeaturedImages
                    textClassName='lg:text-left text-center'
                    className='lg:justify-start justify-center items-center'
                    showStars
                />
                <div className='flex items-center gap-4 justify-center mt-8 mb-12 relative z-10'>
                    <Link href='/register' aria-label='Start your free email security trial'>
                        <Button className='flex space-x-2 items-center group !text-lg'>
                            <span>Start Free Trial</span>{' '}
                            <HiArrowRight
                                className='text-white group-hover:translate-x-1 stroke-[1px] h-3 w-3 mt-0.5 transition-transform duration-200'
                                aria-hidden='true'
                            />
                        </Button>
                    </Link>
                </div>
            </Container>
            <div
                className='flex items-center justify-center relative p-2 md:p-20 cursor-pointer md:-mt-20'
                style={{ position: 'relative' }}
                suppressHydrationWarning
                role='img'
                aria-label='SecPilot dashboard preview'
            >
                <div
                    className='w-full relative'
                    style={{
                        perspective: '1000px',
                        position: 'relative',
                    }}
                >
                    {mounted ? (
                        <Card rotate={rotate} translate={translate} scale={scale}>
                            <Image
                                src={`/hero-screenshot.avif`}
                                alt='SecPilot email security dashboard interface showing real-time threat detection analytics, phishing protection status, and malware scanning results with comprehensive security metrics'
                                height={720}
                                width={1400}
                                className='mx-auto rounded-md grayscale group-hover:grayscale-0 transition duration-200 object-cover object-left-top h-full md:object-left-top'
                                draggable={false}
                                priority
                                quality={65}
                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1400px'
                                placeholder='blur'
                                blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQABAgIDAQAAAAAAAAAAAAABABECIRIxkUFRkaGx/9oADAMBAAIRAxEAPwCdMSjQE2a8YZsGdmzNWOOOOOOOUKdOXzlP/9k='
                            />
                        </Card>
                    ) : (
                        // Server-rendered version - static image visible to crawlers
                        <div className='max-w-6xl z-40 group -mt-12 mx-auto isolate group h-[20rem] md:h-[50rem] w-full border-4 border-neutral-900 p-2 md:p-2 rounded-[30px] shadow-2xl relative bg-[#0a0a0a]'>
                            <div className='h-full w-full overflow-hidden rounded-2xl md:rounded-2xl md:p-4'>
                                <Image
                                    src={`/hero-screenshot.avif`}
                                    alt='SecPilot email security dashboard interface showing real-time threat detection analytics, phishing protection status, and malware scanning results with comprehensive security metrics'
                                    height={720}
                                    width={1400}
                                    className='mx-auto rounded-md object-cover object-left-top h-full md:object-left-top'
                                    draggable={false}
                                    priority
                                    quality={65}
                                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1400px'
                                    placeholder='blur'
                                    blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQABAgIDAQAAAAAAAAAAAAABABECIRIxkUFRkaGx/9oADAMBAAIRAxEAPwCdMSjQE2a8YZsGdmzNWOOOOOOOUKdOXzlP/9k='
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export const Card = ({
    rotate,
    scale,
    translate,
    children,
}: {
    rotate: MotionValue<number>;
    scale: MotionValue<number>;
    translate: MotionValue<number>;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                translateY: translate,
                scale,
                boxShadow:
                    '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
            }}
            className='max-w-6xl z-40 group -mt-12 mx-auto isolate group h-[20rem] md:h-[50rem] w-full border-4 border-neutral-900 p-2 md:p-2 rounded-[30px] shadow-2xl relative'
            initial={{ backgroundColor: '#0a0a0a' }}
        >
            <Beam showBeam className='-top-1 block' />
            <div
                className='absolute h-40 w-full bottom-0 md:-bottom-10 inset-x-0 scale-[1.2] z-20 pointer-events-none [mask-image:linear-gradient(to_top,white_30%,transparent)]'
                style={{ backgroundColor: '#0a0a0a' }}
                aria-hidden='true'
            />
            <motion.div
                className='absolute inset-0 z-20 group-hover:bg-black/0 flex items-center justify-center'
                initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
                transition={{ duration: 0.2 }}
            >
                <LazyVideoModal />
            </motion.div>
            <div
                className=' h-full w-full overflow-hidden rounded-2xl md:rounded-2xl md:p-4'
                style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
            >
                {children}
            </div>
        </motion.div>
    );
};
