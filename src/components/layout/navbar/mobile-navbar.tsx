'use client';
import { cn } from '@/lib/utils';
import { Link } from 'next-view-transitions';
import { useState } from 'react';
import { IoIosMenu } from 'react-icons/io';
import { IoIosClose } from 'react-icons/io';
import { Button } from '@/components/button';
import { Logo } from '@/components/logo';
import { useMotionValueEvent, useScroll, motion } from 'motion/react';
import { LanguageSwitcher } from '@/components/language-switcher';

export const MobileNavbar = ({ navItems, user }: any) => {
    const [open, setOpen] = useState(false);
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
            className={cn('flex justify-between items-center w-full rounded-md px-2.5 py-1.5')}
            initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
            animate={{
                backgroundColor: showBackground ? 'rgb(23, 23, 23)' : 'rgba(0, 0, 0, 0)',
            }}
            transition={{ duration: 0.2 }}
            style={{
                boxShadow: showBackground
                    ? '0px -2px 0px 0px rgb(38, 38, 38), 0px 2px 0px 0px rgb(38, 38, 38)'
                    : 'none',
            }}
        >
            <Logo />
            <IoIosMenu className='text-white h-6 w-6' onClick={() => setOpen(!open)} />
            {open && (
                <div className='fixed inset-0 bg-black z-50 flex flex-col items-start justify-start space-y-10  pt-5  text-xl text-zinc-600  transition duration-200 hover:text-zinc-800'>
                    <div className='flex items-center justify-between w-full px-5'>
                        <Logo />
                        <div className='flex items-center space-x-2'>
                            <IoIosClose
                                className='h-8 w-8 text-white'
                                onClick={() => setOpen(!open)}
                            />
                        </div>
                    </div>
                    <div className='flex flex-col items-start justify-start gap-[14px] px-8'>
                        {navItems.map((navItem: any, idx: number) => (
                            <>
                                {navItem.children && navItem.children.length > 0 ? (
                                    <>
                                        {navItem.children.map((childNavItem: any, idx: number) => (
                                            <Link
                                                key={`link=${idx}`}
                                                href={childNavItem.link}
                                                onClick={() => setOpen(false)}
                                                className='relative max-w-[15rem] text-left text-2xl'
                                            >
                                                <span className='block text-white'>
                                                    {childNavItem.title}
                                                </span>
                                            </Link>
                                        ))}
                                    </>
                                ) : (
                                    <Link
                                        key={`link=${idx}`}
                                        href={navItem.link}
                                        onClick={() => setOpen(false)}
                                        className='relative'
                                    >
                                        <span className='block text-[26px] text-white'>
                                            {navItem.title}
                                        </span>
                                    </Link>
                                )}
                            </>
                        ))}
                    </div>
                    <div className='flex flex-col w-full items-start gap-4 px-8 py-4'>
                        <div className='mb-2'>
                            <LanguageSwitcher />
                        </div>
                        <div className='flex flex-row gap-2.5'>
                            {user ? (
                                <Button
                                    as={Link}
                                    href='/dashboard'
                                    onClick={() => {
                                        setOpen(false);
                                    }}
                                >
                                    Dashboard
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        as={Link}
                                        href='/login'
                                        onClick={() => {
                                            setOpen(false);
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant='simple'
                                        as={Link}
                                        href='/register'
                                        onClick={() => {
                                            setOpen(false);
                                        }}
                                    >
                                        Register
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
