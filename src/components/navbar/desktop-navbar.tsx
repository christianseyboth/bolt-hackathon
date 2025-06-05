'use client';
import { Logo } from '@/components/logo';
import { Button } from '../button';
import { NavBarItem } from './navbar-item';
import { useMotionValueEvent, useScroll, motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link } from 'next-view-transitions';

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
                'w-full flex relative justify-between px-4 py-3 rounded-[15px]  transition duration-200 bg-dark mx-auto'
            )}
            animate={{
                width: showBackground ? '80%' : '100%',
                background: showBackground ? 'var(--background)' : 'transparent',
            }}
            transition={{
                duration: 0.4,
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
                        className='absolute inset-0 h-full w-full bg-neutral-900 pointer-events-none [mask-image:linear-gradient(to_bottom,var(--background),transparent,white)] rounded-[15px] '
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
            <div className='flex space-x-2 items-center'>
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
