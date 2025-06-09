'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconFilter, IconSearch, IconCalendar } from '@tabler/icons-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

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
        <div className='flex flex-col md:flex-row justify-between md:items-end gap-2 md:gap-4 mb-4'>
            {/* Search */}
            <div className='relative flex-1 max-w-sm'>
                <IconSearch className='absolute left-3 top-2.5 h-4 w-4 text-neutral-400' />
                <Input
                    type='text'
                    placeholder='Search for an Email...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9 h-9 w-full rounded-md bg-neutral-800 border-neutral-700 text-white text-sm'
                />
            </div>

            <div className='flex align-middle gap-2'>
                <Button
                    variant='ghost'
                    size='sm'
                    className='flex items-center hover:bg-none!important'
                >
                    <IconFilter className='h-4 w-4' /> Filter:
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm' className='flex items-center'>
                            <IconCalendar className='h-4 w-4 mr-2' />
                            {datePreset === 'custom'
                                ? dateRange.from && dateRange.to
                                    ? `${dateRange.from.toLocaleDateString()} – ${dateRange.to.toLocaleDateString()}`
                                    : 'Custom'
                                : DATE_RANGES.find((r) => r.key === datePreset)?.label || 'Date'}
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
                        {/* DatePicker nur wenn custom */}
                        {datePreset === 'custom' && (
                            <div className='p-2'>
                                <DateRangePicker date={dateRange} setDate={setDateRange} />
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Kategorie-Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm' className='ml-1 cursor-pointer'>
                            Category
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

                {/* Threat-Level-Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm' className='ml-1 cursor-pointer'>
                            Threat Level
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
