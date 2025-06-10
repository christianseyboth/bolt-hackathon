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
    user: any;
}

export function DashboardHeader({
    heading,
    subheading,
    className,
    children,
    user,
}: DashboardHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col md:flex-row justify-between items-start md:items-center mt-2',
                className
            )}
        >
            <div>
                <h1 className='text-2xl md:text-3xl font-bold'>{heading}</h1>
                {subheading && <p className='text-neutral-400 text-sm mt-1'>{subheading}</p>}
            </div>
            <div className='flex items-center mt-4 md:mt-0 space-x-2'>
                <NotificationBell />
                <AvatarMenu user={user} />
            </div>
            {children}
        </div>
    );
}
