import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

function getRiskBadge(risk: string) {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (risk) {
        case 'critical':
        case 'high':
            return <span className={`${baseClasses} bg-red-900/30 text-red-400`}>High Risk</span>;
        case 'medium':
            return (
                <span className={`${baseClasses} bg-amber-900/30 text-amber-400`}>Medium Risk</span>
            );
        case 'low':
            return (
                <span className={`${baseClasses} bg-emerald-900/30 text-emerald-400`}>
                    Low Risk
                </span>
            );
        default:
            return (
                <span className={`${baseClasses} bg-neutral-900/30 text-neutral-400`}>{risk}</span>
            );
    }
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today at ${time}`;
    if (isYesterday) return `Yesterday at ${time}`;
    return `${date.toLocaleDateString()} at ${time}`;
}

export function PhishingAttempts({ attempts = [] }: any) {
    return (
        <Card className='border border-neutral-800 bg-neutral-900'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium'>Recent Phishing Attempts</CardTitle>
            </CardHeader>
            <CardContent>
                {attempts.length === 0 ? (
                    <div className='text-xs text-neutral-400'>
                        No phishing attempts detected recently.
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {attempts.map((attempt: any, index: number) => (
                            <div
                                key={index}
                                className='flex justify-between items-start border-b border-neutral-800 pb-3 last:border-0 last:pb-0'
                            >
                                <div className='overflow-hidden'>
                                    <div className='font-medium text-sm truncate max-w-[160px] mb-1'>
                                        {attempt.sender_email}
                                    </div>
                                    <div className='text-xs text-neutral-400'>
                                        {formatDate(attempt.created_at)}
                                    </div>
                                </div>
                                <div>{getRiskBadge(attempt.threat_level)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
