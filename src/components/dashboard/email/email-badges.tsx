import {
    IconAlertOctagon,
    IconMailOff,
    IconBug,
    IconShieldOff,
    IconAlertTriangle,
    IconShieldCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { JSX } from 'react';

export function CategoryBadge({ category }: { category: string }) {
    const categories: Record<string, { color: string; icon: JSX.Element; label: string }> = {
        phishing: {
            color: 'bg-purple-900/30 text-purple-400',
            icon: <IconAlertOctagon className='h-3 w-3 mr-1' />,
            label: 'Phishing',
        },
        spam: {
            color: 'bg-blue-900/30 text-blue-400',
            icon: <IconMailOff className='h-3 w-3 mr-1' />,
            label: 'Spam',
        },
        malware: {
            color: 'bg-red-900/30 text-red-400',
            icon: <IconBug className='h-3 w-3 mr-1' />,
            label: 'Malware',
        },
        scam: {
            color: 'bg-orange-900/30 text-orange-400',
            icon: <IconShieldOff className='h-3 w-3 mr-1' />,
            label: 'Scam',
        },
        other: {
            color: 'bg-neutral-900/30 text-neutral-400',
            icon: <IconAlertTriangle className='h-3 w-3 mr-1' />,
            label: 'Other',
        },
        clean: {
            color: 'bg-emerald-900/30 text-emerald-400',
            icon: <IconShieldCheck className='h-3 w-3 mr-1' />,
            label: 'Clean',
        },
    };
    const info = categories[category] || categories['other'];
    return (
        <span
            className={cn(
                'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center mr-1',
                info.color
            )}
        >
            {info.icon}
            <span>{info.label}</span>
        </span>
    );
}

export function ThreatLevelBadge({ level }: { level: string }) {
    const levels: Record<string, string> = {
        critical: 'bg-red-900/40 text-red-400',
        high: 'bg-red-900/30 text-red-400',
        medium: 'bg-amber-900/30 text-amber-400',
        low: 'bg-emerald-900/20 text-emerald-400',
    };
    const levelText = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    return (
        <span
            className={cn(
                'px-2 py-1 rounded-full text-xs font-semibold ml-1',
                levels[level] || 'bg-neutral-900/30 text-neutral-400'
            )}
        >
            {levelText}
        </span>
    );
}
