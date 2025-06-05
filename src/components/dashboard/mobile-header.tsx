'use client';
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
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

export function MobileHeader() {
    const [open, setOpen] = React.useState(false);
    const [pending, startTransition] = useTransition();

    return (
        <div className='flex md:hidden items-center justify-between px-4 py-2 border-b border-neutral-800'>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant='ghost' size='icon'>
                        <IconMenu2 className='h-5 w-5' />
                    </Button>
                </SheetTrigger>
                <SheetContent side='left' className='p-0 w-64'>
                    <Sidebar />
                </SheetContent>
            </Sheet>
            <Logo />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='rounded-full'>
                        <Avatar>
                            <AvatarImage src='https://i.pravatar.cc/150?img=1' />
                            <AvatarFallback>
                                <span className='sr-only'>User Menu</span>
                                <IconDeviceLaptop className='h-5 w-5' />
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <div className='px-2 py-1.5 text-sm font-medium'>Mail</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <a href='/dashboard/settings'>Settings</a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <form>
                        <DropdownMenuItem asChild>
                            <button
                                formAction={signOut}
                                disabled={pending}
                                style={{ width: '100%' }}
                            >
                                Logout
                            </button>
                        </DropdownMenuItem>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
