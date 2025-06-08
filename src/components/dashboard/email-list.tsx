'use client';

import React, { useState, useEffect, JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
    IconSearch,
    IconFilter,
    IconChevronRight,
    IconShieldCheck,
    IconAlertTriangle,
    IconAlertOctagon,
    IconBug,
    IconMailOff,
    IconShieldOff,
} from '@tabler/icons-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function EmailList({ emails }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [tab, setTab] = useState<'all' | 'threats' | 'clean'>('all');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        setPage(1);
    }, [searchQuery, tab]);

    // Handle search functionality
    const filteredEmails = emails.filter((email: any) => {
        // Tab filter
        if (tab === 'threats' && !['phishing', 'suspicious'].includes(email.category)) return false;
        if (tab === 'clean' && email.threat_level !== 'low') return false;
        // Search filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            return (
                email.sender?.toLowerCase().includes(query) ||
                email.subject?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const totalResults = filteredEmails.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    const paginatedEmails = filteredEmails.slice((page - 1) * pageSize, page * pageSize);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Render status badge based on email status
    function renderStatusBadges(category: string, threatLevel: string) {
        // Special case: treat "clean" or "other" + "low" as clean
        if (category === 'clean' || (category === 'other' && threatLevel === 'low')) {
            return <CategoryBadge category='clean' />;
        }
        return (
            <div className='flex items-center space-x-1'>
                <CategoryBadge category={category} />
                <ThreatLevelBadge level={threatLevel} />
            </div>
        );
    }

    return (
        <Card className='border-neutral-800 bg-neutral-900'>
            <CardHeader className='space-y-4 pb-4'>
                <CardTitle className='text-xl'>Email Analysis</CardTitle>

                <div className='flex flex-col md:flex-row justify-between space-y-3 md:space-y-0'>
                    <div className='relative flex-1 max-w-sm'>
                        <IconSearch className='absolute left-3 top-2.5 h-4 w-4 text-neutral-400' />
                        <input
                            type='text'
                            placeholder='Search emails...'
                            value={searchQuery}
                            onChange={handleSearch}
                            className='pl-9 h-9 w-full rounded-md bg-neutral-800 border-neutral-700 text-white text-sm focus:ring-1 focus:ring-neutral-600 placeholder:text-neutral-400'
                        />
                    </div>

                    <div className='flex space-x-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            className='text-neutral-300 border-none cursor-auto bg-transparent hover:bg-transparent hover:text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            <IconFilter className='h-4 w-4 mr-2' />
                            Filter
                        </Button>
                        <Tabs value={tab} onValueChange={setTab as any} className='inline-flex h-9'>
                            <TabsList className='grid grid-cols-3 h-9'>
                                <TabsTrigger value='all' className='text-xs cursor-pointer'>
                                    All
                                </TabsTrigger>
                                <TabsTrigger value='threats' className='text-xs cursor-pointer'>
                                    Threats
                                </TabsTrigger>
                                <TabsTrigger value='clean' className='text-xs cursor-pointer'>
                                    Clean
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className='rounded-md border border-neutral-800'>
                    {/* TABLE HEADER */}
                    <div className='bg-neutral-800/50 px-4 py-2 text-xs font-medium grid grid-cols-14 gap-4'>
                        <div className='col-span-1'>Category</div>
                        <div className='col-span-2'>Sender</div>
                        <div className='col-span-2'>Recipient</div>
                        <div className='hidden md:block md:col-span-4'>Subject</div>
                        <div className='col-span-2'>Received</div>
                        <div className='col-span-2 text-right'>Threat Level</div>
                    </div>

                    <div className='divide-y divide-neutral-800'>
                        {paginatedEmails.length > 0 ? (
                            paginatedEmails.map((email: any) => (
                                <Link key={email.id} href={`emails/${email.id}`} className='block'>
                                    <div className='px-4 py-3 grid grid-cols-14 gap-4 hover:bg-neutral-800/50 transition-colors cursor-pointer'>
                                        {/* CATEGORY (first col) */}
                                        <div className='col-span-1 flex items-center'>
                                            <CategoryBadge category={email.category} />
                                        </div>
                                        {/* SENDER */}
                                        <div className='col-span-2 flex flex-col'>
                                            <span className='text-sm font-medium truncate'>
                                                {email.sender_email}
                                            </span>
                                        </div>
                                        {/* RECIPIENT */}
                                        <div className='col-span-2 flex flex-col'>
                                            <span className='text-xs text-neutral-400 truncate '>
                                                {email.from_email}
                                            </span>
                                        </div>
                                        {/* SUBJECT */}
                                        <div className='hidden md:block md:col-span-4'>
                                            <span className='text-sm truncate block'>
                                                {email.subject}
                                            </span>
                                        </div>
                                        {/* RECEIVED */}
                                        <div className='col-span-2 flex items-center'>
                                            <span className='text-xs text-neutral-400'>
                                                {formatDate(email.created_at)}
                                            </span>
                                        </div>
                                        {/* THREAT LEVEL (last col) */}
                                        <div className='col-span-2 flex items-center justify-end'>
                                            <ThreatLevelBadge level={email.threat_level} />
                                            <IconChevronRight className='h-4 w-4 text-neutral-500 ml-2' />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className='px-4 py-8 text-center text-neutral-400'>
                                No emails matching your search criteria.
                            </div>
                        )}
                    </div>
                </div>

                {totalResults > 0 && (
                    <div className='flex justify-between items-center mt-4'>
                        <div className='text-sm text-neutral-400'>
                            Page <span className='font-medium text-neutral-300'>{page}</span> of{' '}
                            <span className='font-medium text-neutral-300'>{totalPages}</span> (
                            {totalResults} emails)
                        </div>
                        <div className='flex space-x-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className='text-neutral-300 border-neutral-700'
                            >
                                Previous
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalResults === 0}
                                className='text-neutral-300 border-neutral-700'
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Helper

function CategoryBadge({ category }: { category: string }) {
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

function ThreatLevelBadge({ level }: { level: string }) {
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
