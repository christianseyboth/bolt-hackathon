'use client';
import { createClient } from '@/utils/supabase/client';
import { DesktopNavbar } from './desktop-navbar';
import { MobileNavbar } from './mobile-navbar';
import { motion } from 'motion/react';

const navItems = [
    {
        title: 'Pricing',
        link: '/pricing',
    },
    {
        title: 'Contact',
        link: '/contact',
    },
];

export function NavBar({ user }: any) {
    return (
        <motion.nav
            initial={{
                y: -80,
                opacity: 0,
            }}
            animate={{
                y: 0,
                opacity: 1,
            }}
            transition={{
                ease: [0.6, 0.05, 0.1, 0.9],
                duration: 0.8,
            }}
            className='fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl'
            style={{
                position: 'fixed',
                top: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                width: '95%',
                maxWidth: '1280px',
            }}
        >
            <div className='hidden lg:block w-full'>
                <DesktopNavbar navItems={navItems} user={user} />
            </div>
            <div className='flex h-full w-full items-center lg:hidden'>
                <MobileNavbar navItems={navItems} user={user} />
            </div>
        </motion.nav>
    );
}
