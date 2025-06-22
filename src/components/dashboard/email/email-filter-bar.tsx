'use client';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { IconFilter, IconSearch, IconCalendar } from '@tabler/icons-react';
import { DateRangePicker } from '@/components/ui/DateRangePicker';

export interface EmailFilterBarProps {
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    dateRange: { from: Date | undefined; to: Date | undefined };
    setDateRange: (v: { from: Date | undefined; to: Date | undefined }) => void;
    datePreset: string; // "all" | "7d" | "30d" | "custom"
    setDatePreset: (v: string) => void;
    category: string;
    setCategory: (v: string) => void;
    threatLevel: string;
    setThreatLevel: (v: string) => void;
}

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All Categories' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'spam', label: 'Spam' },
    { value: 'malware', label: 'Malware' },
    { value: 'scam', label: 'Scam' },
    { value: 'other', label: 'Other' },
];

const LEVEL_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

const DATE_RANGES = [
    { key: 'all', label: 'All' },
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: 'custom', label: 'Custom' },
];

export function EmailFilterBar(props: EmailFilterBarProps) {
    const {
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        setCategory,
        setThreatLevel,
        setDatePreset,
        datePreset,
    } = props;

    return (
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center sm:justify-between'>
            {/* Search */}
            <div className='w-full sm:w-auto sm:min-w-[240px]'>
                <div className='relative'>
                    <IconSearch className='absolute left-3 top-2.5 h-4 w-4 text-neutral-400' />
                    <Input
                        type='text'
                        placeholder='Search for an Email...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-9 h-9 w-full rounded-md bg-neutral-800 border-neutral-700 text-white text-sm'
                    />
                </div>
            </div>

            {/* Filters */}
            <div className='flex flex-wrap items-center gap-2'>
                <div className='hidden sm:flex items-center mr-2'>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='flex items-center hover:bg-none!important'
                    >
                        <IconFilter className='h-4 w-4' /> Filter:
                    </Button>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm' className='flex items-center shrink-0'>
                            <IconCalendar className='h-4 w-4 mr-1 sm:mr-2' />
                            <span className='hidden sm:inline'>
                                {datePreset === 'custom'
                                    ? dateRange.from && dateRange.to
                                        ? `${dateRange.from.toLocaleDateString()} – ${dateRange.to.toLocaleDateString()}`
                                        : 'Custom'
                                    : DATE_RANGES.find((r) => r.key === datePreset)?.label || 'Date'}
                            </span>
                            <span className='sm:hidden'>Date</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {DATE_RANGES.map((r) => (
                            <DropdownMenuItem
                                key={r.key}
                                className='cursor-pointer'
                                onClick={() => setDatePreset(r.key)}
                            >
                                {r.label}
                            </DropdownMenuItem>
                        ))}
                        {datePreset === 'custom' && (
                            <div className='p-2'>
                                <DateRangePicker date={dateRange} setDate={setDateRange} />
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm' className='shrink-0'>
                            <span className='hidden sm:inline'>Category</span>
                            <span className='sm:hidden'>Cat</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                onClick={() => setCategory(opt.value)}
                                className='cursor-pointer'
                            >
                                {opt.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm' className='shrink-0'>
                            <span className='hidden sm:inline'>Threat Level</span>
                            <span className='sm:hidden'>Level</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {LEVEL_OPTIONS.map((opt) => (
                            <DropdownMenuItem
                                key={opt.value}
                                onClick={() => setThreatLevel(opt.value)}
                                className='cursor-pointer'
                            >
                                {opt.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
