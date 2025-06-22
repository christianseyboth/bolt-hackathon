'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';


export function SecurityOverview({ statistics }: any) {
    // Mock data

    return (
        <Card className='border-neutral-800 bg-neutral-900'>
            <CardContent className='p-6'>
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    {statistics.map((stat: any) => (
                        <StatCard key={stat.id} stat={stat} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface StatCardProps {
    stat: {
        id: string;
        label: string;
        value: string;
        change: string;
        period: string;
        icon: React.ReactNode;
        color: string;
    };
}

function StatCard({ stat }: StatCardProps) {
    const isPositiveChange = stat.change.startsWith('+');
    const changeColor =
        stat.id === 'threats-detected' || stat.id === 'false-positives'
            ? isPositiveChange
                ? 'text-red-400'
                : 'text-emerald-400'
            : isPositiveChange
            ? 'text-emerald-400'
            : 'text-red-400';

    return (
        <div className='rounded-lg bg-neutral-800/50 p-4'>
            <div className='flex items-center'>
                <div className={`p-2 rounded-md bg-${stat.color}-900/30 mr-3`}>{stat.icon}</div>
                <div>
                    <p className='text-sm font-medium text-neutral-300'>{stat.label}</p>
                    <div className='flex items-baseline space-x-2'>
                        <h3 className='text-2xl font-bold'>{stat.value}</h3>
                        <p className={`text-xs ${changeColor} flex items-center`}>
                            {stat.change}
                            <span className='ml-1 text-neutral-400'>{stat.period}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
