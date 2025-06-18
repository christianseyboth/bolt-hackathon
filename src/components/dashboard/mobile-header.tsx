'use client';
import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '../ui/sheet';
import { Button } from '../ui/button';
import { IconDeviceLaptop, IconMenu2 } from '@tabler/icons-react';
import { Logo } from '../logo';
import { Sidebar } from './sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useTransition } from 'react';
import { signOut } from '@/app/auth/actions';
import { useToast } from '../ui/use-toast';
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
    const [pending, startTransition] = useTransition();
    const [account, setAccount] = useState<AccountProfile | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchAccount();
    }, []);

    const fetchAccount = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
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
        startTransition(async () => {
            try {
                await signOut();
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });
    };

    return (
        <div className='flex items-center justify-between px-4 py-2 border-b border-neutral-800'>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant='ghost' size='icon'>
                        <IconMenu2 className='h-5 w-5' />
                    </Button>
                </SheetTrigger>
                <SheetContent side='left' className='p-0 w-64'>
                    <SheetTitle className='sr-only'>Navigation Menu</SheetTitle>
                    <SheetDescription className='sr-only'>
                        Access dashboard navigation and menu items
                    </SheetDescription>
                    <Sidebar onNavigate={() => setOpen(false)} />
                </SheetContent>
            </Sheet>
            <Logo />
            <div className='flex items-center gap-2'>
                <NotificationBell />
                <div className='hidden [@media(min-width:1025px)]:flex items-center mt-4 [@media(min-width:1025px)]:mt-0 space-x-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className='rounded-full'>
                                <Avatar>
                                    <AvatarImage
                                        src={account?.avatar_url ?? undefined}
                                        alt={account?.full_name ?? 'User'}
                                    />
                                    <AvatarFallback>
                                        {account ? (
                                            (account.full_name?.[0]?.toUpperCase() ??
                                            account.billing_email?.[0]?.toUpperCase() ??
                                            'U')
                                        ) : (
                                            <IconDeviceLaptop className='h-5 w-5' />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <div className='px-2 py-1.5 text-sm font-medium'>
                                {account?.full_name || account?.billing_email || 'User'}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href='/dashboard/profile'>Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} disabled={pending}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
