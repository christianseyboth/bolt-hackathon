// components/dashboard/avatar-menu.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
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
import { signOut } from '@/app/auth/actions';

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
    const [pending, startTransition] = useTransition();
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
                const result = await signOut();
                // Check if signOut returned an error
                if (result?.error) {
                    console.error('Logout failed:', result.error);
                    return;
                }
                // Success case - the redirect() in signOut will handle navigation
            } catch (error) {
                // redirect() throws an error to trigger navigation, this is expected
                // Only log if it's not a redirect
                if (error && typeof error === 'object' && 'digest' in error) {
                    // This is likely a Next.js redirect error, which is normal
                    return;
                }
                console.error('Error signing out:', error);
            }
        });
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

                <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={pending}
                    className='text-red-400 cursor-pointer'
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
