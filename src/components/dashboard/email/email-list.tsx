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
        <div className='flex flex-col gap-4'>
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader className='space-y-4 pb-4'>
                    <CardTitle className='text-xl'>Email Analysis</CardTitle>
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
            </Card>

            <div className='border rounded-lg border-neutral-800 bg-neutral-900'>
                <div
                    className='overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#525252 #262626' }}
                >
                    <table className='w-full min-w-[800px] border-collapse'>
                        <thead className='bg-neutral-800/50'>
                            <tr className='text-xs font-medium'>
                                <th className='w-[8%] p-4 text-left'>Category</th>
                                <th className='w-[15%] p-4 text-left'>Sender</th>
                                <th className='w-[15%] p-4 text-left'>Recipient</th>
                                <th className='w-[32%] p-4 text-left'>Subject</th>
                                <th className='w-[15%] p-4 text-left'>Received</th>
                                <th className='w-[15%] p-4 text-right'>Threat Level</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-neutral-800'>
                            {paginatedEmails.length > 0 ? (
                                paginatedEmails.map((email: any) => (
                                    <tr
                                        key={email.id}
                                        onClick={() =>
                                            (window.location.href = `emails/${email.id}`)
                                        }
                                        className='hover:bg-neutral-800/50 transition-colors cursor-pointer'
                                    >
                                        <td className='p-4'>
                                            <div className='flex items-center'>
                                                <CategoryBadge category={email.category} />
                                            </div>
                                        </td>
                                        <td className='p-4'>
                                            <div className='flex flex-col'>
                                                <span className='text-sm font-medium truncate'>
                                                    {email.sender_email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='p-4'>
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-neutral-400 truncate'>
                                                    {email.from_email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='p-4'>
                                            <span className='text-sm truncate block'>
                                                {email.subject}
                                            </span>
                                        </td>
                                        <td className='p-4'>
                                            <span className='text-xs text-neutral-400'>
                                                {formatDate(email.created_at)}
                                            </span>
                                        </td>
                                        <td className='p-4 text-right'>
                                            <div className='flex items-center justify-end gap-2'>
                                                <ThreatLevelBadge level={email.threat_level} />
                                                <IconChevronRight className='h-4 w-4 text-neutral-500' />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6}>
                                        <div className='px-4 py-8 text-center text-neutral-400'>
                                            No Analysis Yet.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            {totalResults > 0 && (
                <Card className='border-neutral-800 bg-neutral-900'>
                    <CardContent>
                        <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                            <div className='text-sm text-neutral-400 text-center sm:text-left'>
                                <span className='hidden sm:inline'>
                                    Page{' '}
                                    <span className='font-medium text-neutral-300'>{page}</span> of{' '}
                                    <span className='font-medium text-neutral-300'>
                                        {totalPages}
                                    </span>{' '}
                                    ({totalResults} Emails)
                                </span>
                                <span className='sm:hidden'>
                                    {page}/{totalPages} ({totalResults} emails)
                                </span>
                            </div>
                            <div className='flex space-x-2'>
                                <Button
                                    variant='simple'
                                    size='sm'
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className='text-neutral-300 border-neutral-700'
                                >
                                    <span className='hidden sm:inline'>Back</span>
                                    <span className='sm:hidden'>←</span>
                                </Button>
                                <Button
                                    variant='simple'
                                    size='sm'
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || totalResults === 0}
                                    className='text-neutral-300 border-neutral-700'
                                >
                                    <span className='hidden sm:inline'>Next</span>
                                    <span className='sm:hidden'>→</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function endOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
