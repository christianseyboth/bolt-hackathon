'use client';

import React, { useState, useEffect } from 'react';
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
    IconLock,
} from '@tabler/icons-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/utils/supabase/client';

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const { toast } = useToast();
    const { user, signOut: authSignOut } = useAuth();
    const [subscriptionAccess, setSubscriptionAccess] = useState<{
        hasReportsAccess: boolean;
        hasSecurityAnalyticsAccess: boolean;
        hasApiAccess: boolean;
        planName: string;
    } | null>(null);

    useEffect(() => {
        if (user) {
            checkSubscriptionAccess();
        }
    }, [user]);

    const checkSubscriptionAccess = async () => {
        try {
            const supabase = createClient();
            if (!user) return;

            // Get user's account
            const { data: account } = await supabase
                .from('accounts')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!account) return;

            // Get current active subscription
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('plan_name, subscription_status')
                .eq('account_id', account.id)
                .eq('subscription_status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const planName = subscription?.plan_name || 'Free';
            const isFreePlan = planName === 'Free';

            // Access rules
            let hasReportsAccess = true; // Free plans can access all features
            let hasSecurityAnalyticsAccess = true;
            let hasApiAccess = true;

            if (!isFreePlan) {
                switch (planName) {
                    case 'Solo':
                        hasReportsAccess = false;
                        hasSecurityAnalyticsAccess = false;
                        hasApiAccess = false;
                        break;
                    case 'Entrepreneur':
                        hasReportsAccess = false;
                        hasSecurityAnalyticsAccess = true;
                        hasApiAccess = false;
                        break;
                    case 'Team':
                        hasReportsAccess = true;
                        hasSecurityAnalyticsAccess = true;
                        hasApiAccess = true;
                        break;
                    default:
                        hasReportsAccess = false;
                        hasSecurityAnalyticsAccess = false;
                        hasApiAccess = false;
                }
            }

            setSubscriptionAccess({
                hasReportsAccess,
                hasSecurityAnalyticsAccess,
                hasApiAccess,
                planName,
            });
        } catch (error) {
            console.error('Error checking subscription access:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await authSignOut();
            if (onNavigate) onNavigate();
        } catch (error) {
            console.error('Logout error:', error);
            toast({
                variant: 'destructive',
                title: 'Logout failed',
                description: 'An unexpected error occurred',
            });
        }
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
                    icon={
                        subscriptionAccess?.hasSecurityAnalyticsAccess ? (
                            <IconShieldCheck className='h-5 w-5' />
                        ) : (
                            <IconLock className='h-5 w-5' />
                        )
                    }
                    isActive={pathname === '/dashboard/security-analytics'}
                    onNavigate={onNavigate}
                    isRestricted={!subscriptionAccess?.hasSecurityAnalyticsAccess}
                >
                    Security Analytics
                </SidebarItem>

                <SidebarItem
                    href='/dashboard/team'
                    icon={<IconUsers className='h-5 w-5' />}
                    isActive={pathname === '/dashboard/team'}
                    data-tour='team-setup'
                    onNavigate={onNavigate}
                >
                    Team
                </SidebarItem>

                <SidebarItem
                    href='/dashboard/reports'
                    icon={
                        subscriptionAccess?.hasReportsAccess ? (
                            <IconFileText className='h-5 w-5' />
                        ) : (
                            <IconLock className='h-5 w-5' />
                        )
                    }
                    isActive={pathname === '/dashboard/reports'}
                    onNavigate={onNavigate}
                    isRestricted={!subscriptionAccess?.hasReportsAccess}
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
                    className='flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors w-full text-neutral-400 hover:text-white hover:bg-neutral-900 cursor-pointer'
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
    isRestricted?: boolean;
}

function SidebarItem({
    href,
    icon,
    children,
    isActive,
    'data-tour': dataTour,
    onNavigate,
    isRestricted,
}: SidebarItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                    ? 'bg-neutral-900 text-white'
                    : isRestricted
                    ? 'text-neutral-500 hover:text-neutral-400 cursor-not-allowed'
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
            <span className={cn(isRestricted && 'opacity-60')}>{children}</span>
            {isRestricted && <IconLock className='h-3 w-3 ml-auto text-amber-400' />}
        </Link>
    );
}
