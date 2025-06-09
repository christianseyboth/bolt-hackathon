'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { IconChevronRight } from '@tabler/icons-react';
import { EmailFilterBar } from '@/components/dashboard/email/email-filter-bar';
import { CategoryBadge, ThreatLevelBadge } from '@/components/dashboard/email/email-badges';
import { Button } from '@/components/button';

export function EmailList({ emails }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(
        () => {
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            return { from: sevenDaysAgo, to: today };
        }
    );
    const [category, setCategory] = useState('all');
    const [threatLevel, setThreatLevel] = useState('all');
    const [datePreset, setDatePreset] = useState('7d');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        setPage(1);
    }, [searchQuery, dateRange, category, threatLevel]);

    useEffect(() => {
        if (datePreset === '7d') {
            const today = new Date();
            const from = new Date(today);
            from.setDate(today.getDate() - 7);
            setDateRange({ from, to: today });
        }
        if (datePreset === '30d') {
            const today = new Date();
            const from = new Date(today);
            from.setDate(today.getDate() - 30);
            setDateRange({ from, to: today });
        }
        if (datePreset === 'all') {
            setDateRange({ from: undefined, to: undefined });
        }
    }, [datePreset]);

    const filteredEmails = useMemo(() => {
        return emails.filter((email: any) => {
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                if (
                    !email.sender?.toLowerCase().includes(query) &&
                    !email.subject?.toLowerCase().includes(query)
                )
                    return false;
            }

            if (category !== 'all' && email.category !== category) return false;

            if (threatLevel !== 'all' && email.threat_level !== threatLevel) return false;

            if (dateRange.from && dateRange.to) {
                const created = new Date(email.created_at);
                if (created < dateRange.from) return false;
                if (created > endOfDay(dateRange.to)) return false;
            }
            return true;
        });
    }, [emails, searchQuery, dateRange, category, threatLevel]);

    // Paging
    const totalResults = filteredEmails.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    const paginatedEmails = filteredEmails
        .slice((page - 1) * pageSize, page * pageSize)
        .sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

    // Helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className='border-neutral-800 bg-neutral-900'>
            <CardHeader className='space-y-4 pb-4'>
                <CardTitle className='text-xl'>Email Analysis</CardTitle>
                {/* FILTERBAR */}
                <EmailFilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    datePreset={datePreset}
                    setDatePreset={setDatePreset}
                    category={category}
                    setCategory={setCategory}
                    threatLevel={threatLevel}
                    setThreatLevel={setThreatLevel}
                />
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
                                        <div className='col-span-1 flex items-center'>
                                            <CategoryBadge category={email.category} />
                                        </div>
                                        <div className='col-span-2 flex flex-col'>
                                            <span className='text-sm font-medium truncate'>
                                                {email.sender_email}
                                            </span>
                                        </div>
                                        <div className='col-span-2 flex flex-col'>
                                            <span className='text-xs text-neutral-400 truncate '>
                                                {email.from_email}
                                            </span>
                                        </div>
                                        <div className='hidden md:block md:col-span-4'>
                                            <span className='text-sm truncate block'>
                                                {email.subject}
                                            </span>
                                        </div>
                                        <div className='col-span-2 flex items-center'>
                                            <span className='text-xs text-neutral-400'>
                                                {formatDate(email.created_at)}
                                            </span>
                                        </div>
                                        <div className='col-span-2 flex items-center justify-end'>
                                            <ThreatLevelBadge level={email.threat_level} />
                                            <IconChevronRight className='h-4 w-4 text-neutral-500 ml-2' />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className='px-4 py-8 text-center text-neutral-400'>
                                Keine Emails gefunden.
                            </div>
                        )}
                    </div>
                </div>

                {/* PAGINATION */}
                {totalResults > 0 && (
                    <div className='flex justify-between items-center mt-4'>
                        <div className='text-sm text-neutral-400'>
                            Page <span className='font-medium text-neutral-300'>{page}</span> of{' '}
                            <span className='font-medium text-neutral-300'>{totalPages}</span> (
                            {totalResults} Emails)
                        </div>
                        <div className='flex space-x-2'>
                            <Button
                                variant='simple'
                                size='sm'
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className='text-neutral-300 border-neutral-700'
                            >
                                Back
                            </Button>
                            <Button
                                variant='simple'
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

function endOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
