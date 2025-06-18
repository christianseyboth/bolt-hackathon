import React, { Fragment } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { cn } from '@/lib/utils';

export function DateRangePicker({
    date,
    setDate,
    className,
}: {
    date: { from: Date | undefined; to: Date | undefined };
    setDate: (range: { from: Date | undefined; to: Date | undefined }) => void;
    className?: string;
}) {
    return (
        <div className={cn('grid gap-2', className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id='date'
                        variant={'outline'}
                        className={cn(
                            'w-[240px] justify-start text-left font-normal',
                            !date.from && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {date.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, 'LLL dd, y')} -{' '}
                                    {format(date.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(date.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                        autoFocus
                        mode='range'
                        defaultMonth={date.from}
                        selected={date}
                        onSelect={(range) => {
                            if (range && 'from' in range && 'to' in range) {
                                setDate({ from: range.from, to: range.to });
                            } else {
                                setDate({ from: undefined, to: undefined });
                            }
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
