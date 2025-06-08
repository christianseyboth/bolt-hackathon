import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { IconMail, IconShieldCheck, IconShieldX, IconAlertOctagon } from '@tabler/icons-react';

export function RecentActivity({ activities }: any) {
    const getMessage = (activity: any) => {
        if (activity.event_type === 'scan') {
            return `Scanned email from ${activity.sender_email}`;
        }
        if (activity.event_type === 'threat') {
            return `Blocked ${
                activity.category?.charAt(0).toUpperCase() + activity.category?.slice(1)
            } attempt (${activity.sender_email})`;
        }
        if (activity.event_type === 'false_positive') {
            return `Marked false positive (${activity.sender_email})`;
        }
        return 'Security event';
    };

    const getIcon = (activity: any) => {
        if (activity.event_type === 'threat') {
            return <IconShieldX className='h-4 w-4 text-red-400' />;
        }
        if (activity.event_type === 'false_positive') {
            return <IconShieldCheck className='h-4 w-4 text-amber-400' />;
        }
        if (activity.event_type === 'scan') {
            return <IconMail className='h-4 w-4 text-cyan-400' />;
        }
        return <IconAlertOctagon className='h-4 w-4 text-neutral-400' />;
    };

    // Zeitangabe
    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = (now.getTime() - time.getTime()) / 1000;
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        // Optional: heute, gestern, Datum
        return (
            time.toLocaleDateString() +
            ' ' +
            time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
    };

    return (
        <Card className='border border-neutral-800 bg-neutral-900'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium'>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-4'>
                    {activities.length === 0 && (
                        <div className='text-xs text-neutral-400 text-center py-6'>
                            No recent activity.
                        </div>
                    )}
                    {activities.map((activity: any, index: number) => (
                        <div
                            key={activity.id || index}
                            className='flex items-start space-x-3 border-b border-neutral-800 pb-3 last:border-0 last:pb-0'
                        >
                            <div className='mt-0.5 bg-neutral-800 rounded-full p-1.5 flex-shrink-0'>
                                {getIcon(activity)}
                            </div>
                            <div className='space-y-0.5'>
                                <div className='text-sm'>{getMessage(activity)}</div>
                                <div className='text-xs text-neutral-400'>
                                    {getTimeAgo(activity.created_at)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
