// components/dashboard/avatar-menu.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/auth-context';

interface AccountProfile {
    id: string;
    billing_email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    provider: string;
}

export function AvatarMenu() {
    const router = useRouter();
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-10 w-10 rounded-full cursor-pointer'>
                    <Avatar>
                        <AvatarImage
                            src={account?.avatar_url ?? undefined}
                            alt={account?.full_name ?? 'User'}
                        />
                        <AvatarFallback>
                            {account?.full_name
                                ? account.full_name
                                      .split(' ')
                                      .map((n: string) => n[0])
                                      .join('')
                                      .slice(0, 2)
                                      .toUpperCase()
                                : account?.billing_email?.[0]?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuLabel>
                    {account?.full_name || account?.billing_email || 'My Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className='cursor-pointer'
                    onClick={() => router.push('/dashboard/profile')}
                >
                    Settings
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleSignOut} className='text-red-400 cursor-pointer'>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
