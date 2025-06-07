'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    IconShieldOff,
    IconMailOff,
    IconBug,
    IconFishHook,
    IconAlertTriangle,
} from '@tabler/icons-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const iconMap = {
    Phishing: <IconFishHook className='h-5 w-5' />,
    Spam: <IconMailOff className='h-5 w-5' />,
    Malware: <IconBug className='h-5 w-5' />,
    Scam: <IconShieldOff className='h-5 w-5' />,
    Other: <IconAlertTriangle className='h-5 w-5' />,
};
const colorMap = {
    Phishing: 'purple',
    Spam: 'blue',
    Malware: 'red',
    Scam: 'orange',
    Other: 'neutral',
};

type IconKeys = keyof typeof iconMap;

export function AttackTypes({ yearlyAttackDataTypes }: any) {
    const total = (yearlyAttackDataTypes ?? []).reduce(
        (sum: any, r: { count: any }) => sum + r.count,
        0
    );

    const attacks = (yearlyAttackDataTypes ?? []).map(
        (r: { category: IconKeys; count: number }, i: number) => ({
            id: i + 1,
            name: r.category.charAt(0).toUpperCase() + r.category.slice(1),
            count: r.count,
            percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
            icon: iconMap[r.category] ?? iconMap.Other,
            color: colorMap[r.category] ?? colorMap.Other,
        })
    );

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            purple: 'bg-purple-500/80',
            blue: 'bg-blue-500/80',
            red: 'bg-red-500/80',
            orange: 'bg-orange-500/80',
            neutral: 'bg-neutral-500/80',
        };
        return colors[color] || 'bg-neutral-500/80';
    };

    const getBgColorClass = (color: string) => {
        const colors: Record<string, string> = {
            purple: 'bg-purple-900/30',
            blue: 'bg-blue-900/30',
            red: 'bg-red-900/30',
            orange: 'bg-orange-900/30',
            neutral: 'bg-neutral-900/30',
        };
        return colors[color] || 'bg-neutral-900/30';
    };

    const getTextColorClass = (color: string) => {
        const colors: Record<string, string> = {
            purple: 'text-purple-400',
            blue: 'text-blue-400',
            red: 'text-red-400',
            orange: 'text-orange-400',
            neutral: 'text-neutral-400',
        };
        return colors[color] || 'text-neutral-400';
    };

    return (
        <Card className='border-neutral-800 bg-neutral-900'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium'>Most Frequent Attack Types</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-6'>
                    {attacks.map((attack: any) => (
                        <div key={attack.id} className='space-y-2'>
                            <div className='flex justify-between items-center'>
                                <div className='flex items-center'>
                                    <div
                                        className={cn(
                                            'p-2 rounded-md mr-2',
                                            getBgColorClass(attack.color)
                                        )}
                                    >
                                        {React.cloneElement(attack.icon, {
                                            // 3) An dieser Stelle greift jetzt die className-Prop
                                            className: cn(
                                                attack.icon.props.className,
                                                getTextColorClass(attack.color)
                                            ),
                                        })}
                                    </div>
                                    <div>
                                        <span className='font-medium'>{attack.name}</span>
                                        <span className='text-xs text-neutral-400 ml-2'>
                                            ({attack.count} emails)
                                        </span>
                                    </div>
                                </div>
                                <div className='text-sm font-medium'>{attack.percentage}%</div>
                            </div>
                            <Progress
                                value={attack.percentage}
                                className='h-2'
                                indicatorClassName={getColorClass(attack.color)}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
