import { cn } from '@/lib/utils';
import { IconBell, IconSettings } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { AvatarMenu } from '@/components/ui/avatar-menu';
import { NotificationBell } from './NotificationBell';

interface DashboardHeaderProps {
    heading: string;
    subheading?: string;
    className?: string;
    children?: React.ReactNode;
}

export function DashboardHeader({
    heading,
    subheading,
    className,
    children,
}: DashboardHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col [@media(min-width:1025px)]:flex-row justify-between items-start [@media(min-width:1025px)]:items-center mt-2',
                className
            )}
        >
            <div>
                <h1 className='text-xl [@media(min-width:1025px)]:text-3xl font-bold'>
                    {heading}
                </h1>
                {subheading && <p className='text-neutral-400 text-sm mt-1'>{subheading}</p>}
            </div>
            <div
                className='hidden [@media(min-width:1025px)]:flex items-center mt-4 [@media(min-width:1025px)]:mt-0 space-x-2'
                data-tour-header-actions='true'
            >
                <NotificationBell />
                <AvatarMenu />
            </div>
            {children}
        </div>
    );
}
