// components/dashboard/avatar-menu.tsx
'use client';

import { useRouter } from 'next/navigation';
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

export function AvatarMenu({
    user,
}: {
    user: { name?: string; avatar_url?: string; email?: string };
}) {
    const router = useRouter();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
                    <Avatar>
                        <AvatarImage src={user?.avatar_url || 'https://i.pravatar.cc/150?img=1'} />
                        <AvatarFallback>
                            {user?.name
                                ? user.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .slice(0, 2)
                                      .toUpperCase()
                                : 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuLabel>{user?.name || user?.email || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                    Settings
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => {
                        // Hier kommt deine Logout-Logik hin (API-Call, Supabase-Logout, etc.)
                        router.push('/login');
                    }}
                    className='text-red-400'
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
