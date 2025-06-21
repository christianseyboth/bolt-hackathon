'use client';
import { Link } from 'next-view-transitions';
import { useState } from 'react';
import { IoIosMenu, IoIosClose } from 'react-icons/io';
import { Button } from '@/components/button';
import { Logo } from '@/components/logo';
import { useMotionValueEvent, useScroll, motion } from 'motion/react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';

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
            className='flex justify-between items-center w-full rounded-md px-2.5 py-1.5'
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
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <button className='p-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-md transition-colors'>
                        <IoIosMenu className='h-6 w-6' />
                    </button>
                </SheetTrigger>

                <SheetContent
                    side='left'
                    className='w-full bg-black border-none p-0 flex flex-col [&>button]:hidden'
                    style={{ zIndex: 99999 }}
                >
                    <SheetHeader className='px-6 pt-6 pb-4 border-b border-gray-800'>
                        <div className='flex items-center justify-between'>
                            <Logo />
                            <SheetClose asChild>
                                <button className='p-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-md transition-colors'>
                                    <IoIosClose className='h-6 w-6' />
                                </button>
                            </SheetClose>
                        </div>
                        <SheetTitle className='sr-only'>Navigation Menu</SheetTitle>
                        <SheetDescription className='sr-only'>
                            Main navigation menu for mobile devices
                        </SheetDescription>
                    </SheetHeader>

                    {/* Navigation Links */}
                    <div className='flex-1 overflow-y-auto px-6 py-6'>
                        <nav className='space-y-6'>
                            {navItems.map((navItem: any, idx: number) => (
                                <div key={`nav-item-${idx}`}>
                                    {navItem.children && navItem.children.length > 0 ? (
                                        <div className='space-y-3'>
                                            {navItem.children.map(
                                                (childNavItem: any, childIdx: number) => (
                                                    <Link
                                                        key={`child-link-${idx}-${childIdx}`}
                                                        href={childNavItem.link}
                                                        onClick={() => setOpen(false)}
                                                        className='block text-white text-xl font-medium hover:text-gray-300 transition-colors py-2'
                                                    >
                                                        {childNavItem.title}
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            key={`parent-link-${idx}`}
                                            href={navItem.link}
                                            onClick={() => setOpen(false)}
                                            className='block text-white text-2xl font-medium hover:text-gray-300 transition-colors py-2'
                                        >
                                            {navItem.title}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className='px-6 py-6 border-t border-gray-800 bg-black'>
                        <div className='flex flex-col gap-3'>
                            {user ? (
                                <Button
                                    variant='primary'
                                    as={Link}
                                    href='/dashboard'
                                    onClick={() => setOpen(false)}
                                    className='w-full text-white hover:bg-gray-200'
                                    size='lg'
                                >
                                    Dashboard
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        as={Link}
                                        href='/login'
                                        onClick={() => setOpen(false)}
                                        className='w-full bg-white text-black hover:bg-gray-200'
                                        size='lg'
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant='primary'
                                        as={Link}
                                        href='/register'
                                        onClick={() => setOpen(false)}
                                        className='w-full  text-white hover:bg-white hover:text-black'
                                        size='lg'
                                    >
                                        Register
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </motion.div>
    );
};
