'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
    IconSearch,
    IconFilter,
    IconChevronRight,
    IconShieldCheck,
    IconAlertTriangle,
    IconAlertOctagon,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Link from 'next/link';

// Mock data for email list
const mockEmails = [
    {
        id: 'email-1',
        sender: 'paypal@service.paypal.com',
        subject: 'Your account needs attention',
        receivedAt: '2023-05-16T09:30:00',
        status: 'phishing',
        threatLevel: 'high',
        flagged: true,
    },
    {
        id: 'email-2',
        sender: 'newsletter@nytimes.com',
        subject: 'Your daily briefing: Top news of the day',
        receivedAt: '2023-05-16T08:15:00',
        status: 'clean',
        threatLevel: 'none',
        flagged: false,
    },
    {
        id: 'email-3',
        sender: 'security@chase.com',
        subject: 'Important security alert for your account',
        receivedAt: '2023-05-15T22:45:00',
        status: 'phishing',
        threatLevel: 'critical',
        flagged: true,
    },
    {
        id: 'email-4',
        sender: 'updates@linkedin.com',
        subject: 'You have 5 new notifications',
        receivedAt: '2023-05-15T17:20:00',
        status: 'clean',
        threatLevel: 'none',
        flagged: false,
    },
    {
        id: 'email-5',
        sender: 'no-reply@amazon.com',
        subject: 'Your Amazon.com order #402-7371294-2138740 has shipped',
        receivedAt: '2023-05-15T14:10:00',
        status: 'clean',
        threatLevel: 'none',
        flagged: false,
    },
    {
        id: 'email-6',
        sender: 'support@microsoftonline.com',
        subject: 'Action required: Your Microsoft account password will expire soon',
        receivedAt: '2023-05-15T11:35:00',
        status: 'suspicious',
        threatLevel: 'medium',
        flagged: true,
    },
    {
        id: 'email-7',
        sender: 'donotreply@netflix.com',
        subject: 'New sign-in to Netflix from a new device',
        receivedAt: '2023-05-14T20:05:00',
        status: 'clean',
        threatLevel: 'none',
        flagged: false,
    },
    {
        id: 'email-8',
        sender: 'billing@dropbox.com',
        subject: 'Your Dropbox subscription receipt',
        receivedAt: '2023-05-14T16:30:00',
        status: 'clean',
        threatLevel: 'none',
        flagged: false,
    },
];

export function EmailList({ emails }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEmails, setFilteredEmails] = useState(emails);

    // Handle search functionality
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === '') {
            setFilteredEmails(emails);
        } else {
            const filtered = emails.filter((email: any) =>
                email.from_email.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredEmails(filtered);
        }
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
    const renderStatusBadge = (status: string, threatLevel: string) => {
        const baseClasses =
            'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1';

        switch (status) {
            case 'clean':
                return (
                    <span className={`${baseClasses} bg-emerald-900/30 text-emerald-400`}>
                        <IconShieldCheck className='h-3 w-3 mr-1' />
                        <span>Clean</span>
                    </span>
                );
            case 'suspicious':
                return (
                    <span className={`${baseClasses} bg-amber-900/30 text-amber-400`}>
                        <IconAlertTriangle className='h-3 w-3 mr-1' />
                        <span>Suspicious</span>
                    </span>
                );
            case 'phishing':
                const bgColor =
                    threatLevel === 'critical'
                        ? 'bg-red-900/40 text-red-400'
                        : 'bg-red-900/30 text-red-400';
                return (
                    <span className={`${baseClasses} ${bgColor}`}>
                        <IconAlertOctagon className='h-3 w-3 mr-1' />
                        <span>{threatLevel === 'critical' ? 'Critical Threat' : 'Phishing'}</span>
                    </span>
                );
            default:
                return null;
        }
    };

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
                            className='text-neutral-300 border-neutral-700'
                        >
                            <IconFilter className='h-4 w-4 mr-2' />
                            Filter
                        </Button>
                        <Tabs defaultValue='all' className='inline-flex h-9'>
                            <TabsList className='grid grid-cols-3 h-9'>
                                <TabsTrigger value='all' className='text-xs'>
                                    All
                                </TabsTrigger>
                                <TabsTrigger value='threats' className='text-xs'>
                                    Threats
                                </TabsTrigger>
                                <TabsTrigger value='clean' className='text-xs'>
                                    Clean
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className='rounded-md border border-neutral-800'>
                    <div className='bg-neutral-800/50 px-4 py-2 text-xs font-medium grid grid-cols-12 gap-4'>
                        <div className='col-span-5 md:col-span-4'>Sender / Subject</div>
                        <div className='hidden md:block md:col-span-4'>Subject</div>
                        <div className='col-span-4 md:col-span-2'>Received</div>
                        <div className='col-span-3 md:col-span-2'>Status</div>
                    </div>

                    <div className='divide-y divide-neutral-800'>
                        {filteredEmails.length > 0 ? (
                            filteredEmails.map((email: any) => (
                                <Link key={email.id} href={`/emails/${email.id}`} className='block'>
                                    <div className='px-4 py-3 grid grid-cols-12 gap-4 hover:bg-neutral-800/50 transition-colors cursor-pointer'>
                                        <div className='col-span-5 md:col-span-4 flex flex-col'>
                                            <span className='text-sm font-medium truncate'>
                                                {email.from_email}
                                            </span>
                                            <span className='text-xs text-neutral-400 truncate md:hidden'>
                                                {email.metadata.from}
                                            </span>
                                        </div>
                                        <div className='hidden md:block md:col-span-4'>
                                            <span className='text-sm truncate block'>
                                                {email.subject}
                                            </span>
                                        </div>
                                        <div className='col-span-4 md:col-span-2 flex items-center'>
                                            <span className='text-xs text-neutral-400'>
                                                {formatDate(email.analyzed_at)}
                                            </span>
                                        </div>
                                        <div className='col-span-3 md:col-span-2 flex items-center justify-between'>
                                            {renderStatusBadge(email.category, email.threat_level)}
                                            <IconChevronRight className='h-4 w-4 text-neutral-500' />
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

                {filteredEmails.length > 0 && (
                    <div className='flex justify-between items-center mt-4'>
                        <div className='text-sm text-neutral-400'>
                            Showing{' '}
                            <span className='font-medium text-neutral-300'>
                                {filteredEmails.length}
                            </span>{' '}
                            of{' '}
                            <span className='font-medium text-neutral-300'>
                                {mockEmails.length}
                            </span>{' '}
                            emails
                        </div>
                        <div className='flex space-x-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                disabled
                                className='text-neutral-300 border-neutral-700'
                            >
                                Previous
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
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
