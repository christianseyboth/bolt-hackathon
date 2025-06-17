'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../logo';
import {
    IconDashboard,
    IconMail,
    IconShieldCheck,
    IconUsers,
    IconSettings,
    IconLogout,
    IconDeviceLaptop,
    IconFileText,
    IconCreditCard,
} from '@tabler/icons-react';
import { useToast } from '@/components/ui/use-toast';
import { signOut } from '@/app/auth/actions';

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const { toast } = useToast();

    const handleLogout = async () => {
        await signOut();
        toast({
            title: 'Logged out',
            description: 'You have been successfully logged out.',
        });
    };

    return (
        <div
            className={cn(
                'w-64 border-r border-neutral-800 h-screen py-6 px-4 flex flex-col bg-neutral-950',
                className
            )}
        >
            <div className='px-2 mb-8'>
                <Logo />
            </div>

            <nav className='flex-1 space-y-1'>
                <SidebarItem
                    href='/dashboard'
                    icon={<IconDashboard className='h-5 w-5' />}
                    isActive={pathname === '/dashboard'}
                    onNavigate={onNavigate}
                >
                    Dashboard
                </SidebarItem>

                <SidebarItem
                    href='/dashboard/emails'
                    icon={<IconMail className='h-5 w-5' />}
                    isActive={
                        pathname === '/dashboard/emails' ||
                        pathname.startsWith('/dashboard/emails/')
                    }
                    onNavigate={onNavigate}
                >
                    Email Analysis
                </SidebarItem>

                <SidebarItem
                    href='/dashboard/security-analytics'
                    icon={<IconShieldCheck className='h-5 w-5' />}
                    isActive={pathname === '/dashboard/security-analytics'}
                    onNavigate={onNavigate}
                >
                    Security Analytics
                </SidebarItem>

                <SidebarItem
                    href='/dashboard/team'
                    icon={<IconUsers className='h-5 w-5' />}
                    isActive={pathname === '/dashboard/team'}
                    data-tour="team-setup"
                    onNavigate={onNavigate}
                >
                    Team
                </SidebarItem>

                <SidebarItem
                    href='/dashboard/reports'
                    icon={<IconFileText className='h-5 w-5' />}
                    isActive={pathname === '/dashboard/reports'}
                    onNavigate={onNavigate}
                >
                    Reports
                </SidebarItem>
                <SidebarItem
                    href='/dashboard/subscription'
                    icon={<IconCreditCard className='h-5 w-5' />}
                    isActive={pathname === '/dashboard/subscription'}
                    onNavigate={onNavigate}
                >
                    Subscription
                </SidebarItem>
            </nav>

            <div className='space-y-1 pt-6 mt-6 border-t border-neutral-800'>
                <SidebarItem
                    href='/dashboard/profile'
                    icon={<IconSettings className='h-5 w-5' />}
                    isActive={pathname === '/dashboard/profile'}
                    onNavigate={onNavigate}
                >
                    Settings
                </SidebarItem>


                <button
                    onClick={handleLogout}
                    className='flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors w-full text-neutral-400 hover:text-white hover:bg-neutral-900'
                >
                    <IconLogout className='h-5 w-5' />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

interface SidebarItemProps {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isActive?: boolean;
    'data-tour'?: string;
    onNavigate?: () => void;
}

function SidebarItem({ href, icon, children, isActive, 'data-tour': dataTour, onNavigate }: SidebarItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            )}
            data-tour={dataTour}
            onClick={() => {
                if (onNavigate) {
                    onNavigate();
                }
            }}
        >
            {icon}
            <span>{children}</span>
        </Link>
    );
}
