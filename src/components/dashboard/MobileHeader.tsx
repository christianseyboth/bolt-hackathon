'use client';
import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
    SheetClose,
} from '../ui/Sheet';
import { Button } from '../ui/Button';
import { IconDeviceLaptop, IconMenu2, IconX } from '@tabler/icons-react';
import { Logo } from '../Logo';
import { Sidebar } from './Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/DropdownMenu';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/utils/supabase/client';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import Link from 'next/link';

interface AccountProfile {
    id: string;
    billing_email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    provider: string;
}

export function MobileHeader() {
    const [open, setOpen] = React.useState(false);
    const [account, setAccount] = useState<AccountProfile | null>(null);
    const { user, signOut: authSignOut } = useAuth();
    const supabase = createClient();

    useEffect(() => {
        if (user) {
            fetchAccount();
        }
    }, [user]);

    const fetchAccount = async () => {
        try {
            if (!user) return;

            const { data: accountData } = await supabase
                .from('accounts')
                .select('id, billing_email, full_name, avatar_url, provider')
                .eq('owner_id', user.id)
                .single();

            if (accountData) {
                setAccount(accountData);
            }
        } catch (error) {
            console.error('Error fetching account:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await authSignOut();
            // Use hard redirect to prevent 500 errors
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className='flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950 relative'>
            {/* Left: Burger Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant='ghost' size='icon' className='shrink-0'>
                        <IconMenu2 className='h-5 w-5' />
                    </Button>
                </SheetTrigger>
                <SheetContent side='left' className='p-0 w-64 [&>button]:hidden'>
                    <SheetTitle className='sr-only'>Navigation Menu</SheetTitle>
                    <SheetDescription className='sr-only'>
                        Access dashboard navigation and menu items
                    </SheetDescription>
                    {/* Custom Header with Logo and Close Button */}
                    <div className='flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950'>
                        <Logo />
                        <SheetClose asChild>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8 text-neutral-400 hover:text-white'
                            >
                                <IconX className='h-5 w-5' />
                            </Button>
                        </SheetClose>
                    </div>
                    {/* Sidebar Content with Custom Mobile Layout */}
                    <div
                        className='h-[calc(100vh-73px)] overflow-y-auto pb-safe [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'
                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#525252 #262626' }}
                    >
                        <Sidebar onNavigate={() => setOpen(false)} isMobile={true} />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Perfectly Centered Logo */}
            <div className='absolute left-1/2 transform -translate-x-1/2'>
                <Logo />
            </div>

            {/* Right: User Actions */}
            <div className='flex items-center gap-2 shrink-0'>
                <NotificationBell />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='rounded-full'>
                            <Avatar className='h-8 w-8'>
                                <AvatarImage
                                    src={account?.avatar_url ?? undefined}
                                    alt={account?.full_name ?? 'User'}
                                />
                                <AvatarFallback className='text-xs'>
                                    {account ? (
                                        account.full_name?.[0]?.toUpperCase() ??
                                        account.billing_email?.[0]?.toUpperCase() ??
                                        'U'
                                    ) : (
                                        <IconDeviceLaptop className='h-4 w-4' />
                                    )}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='bg-neutral-900 border-neutral-800'>
                        <div className='px-2 py-1.5 text-sm font-medium'>
                            {account?.full_name || account?.billing_email || 'User'}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href='/dashboard/profile'>Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
