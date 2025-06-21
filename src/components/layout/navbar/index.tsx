'use client';

import { DesktopNavbar } from './desktop-navbar';
import { MobileNavbar } from './mobile-navbar';
import { motion } from 'motion/react';
import { useAuth } from '@/context/auth-context';

const navItems = [
    {
        title: 'Pricing',
        link: '/pricing',
    },
    {
        title: 'Contact',
        link: '/contact',
    },
    {
        title: 'About',
        link: '/about',
    },
];

export function NavBar() {
    const { user, loading } = useAuth();
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
