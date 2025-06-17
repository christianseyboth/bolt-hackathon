'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/button';
import { NavBarItem } from './navbar-item';
import { useMotionValueEvent, useScroll, motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link } from 'next-view-transitions';
import { LanguageSwitcher } from '@/components/language-switcher';

type Props = {
    user: any;
    navItems: {
        link: string;
        title: string;
        target?: '_blank';
    }[];
};

export const DesktopNavbar = ({ navItems, user }: Props) => {
    const { scrollY } = useScroll();
    const [showBackground, setShowBackground] = useState(false);

    useMotionValueEvent(scrollY, 'change', (value) => {
        if (value > 100) {
            setShowBackground(true);
        } else {
            setShowBackground(false);
        }
    });
    return (
        <motion.div
            className={cn(
                'w-full flex relative justify-between px-4 py-3 rounded-[15px] transition duration-200 mx-auto backdrop-blur-lg border border-white/10'
            )}
            initial={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            animate={{
                width: showBackground ? '80%' : '100%',
                backgroundColor: showBackground ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
            }}
            transition={{
                duration: 0.4,
                ease: 'easeInOut',
            }}
            style={{
                position: 'relative',
            }}
        >
            <AnimatePresence>
                {showBackground && (
                    <motion.div
                        key={String(showBackground)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 1,
                        }}
                        className='absolute inset-0 h-full w-full pointer-events-none rounded-[15px]'
                        style={{
                            backgroundColor: 'rgb(23, 23, 23)',
                            maskImage:
                                'linear-gradient(to bottom, rgba(0,0,0,1), transparent, rgba(255,255,255,1))',
                        }}
                    />
                )}
            </AnimatePresence>
            <div className='flex flex-row gap-2 items-center'>
                <Logo />
                <div className='flex items-center gap-1.5'>
                    {navItems.map((item) => (
                        <NavBarItem href={item.link} key={item.title} target={item.target}>
                            {item.title}
                        </NavBarItem>
                    ))}
                </div>
            </div>
            <div className='flex space-x-2 items-center' data-lingo-skip>
                <LanguageSwitcher />

                {user ? (
                    <Button variant='primary' as={Link} href='/dashboard'>
                        Dashboard
                    </Button>
                ) : (
                    <>
                        <Button variant='simple' as={Link} href='/register'>
                            Register
                        </Button>
                        <Button variant='primary' as={Link} href='/login'>
                            Login
                        </Button>
                    </>
                )}
            </div>
        </motion.div>
    );
};
