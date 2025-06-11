import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { IconCrown } from '@tabler/icons-react';
import Link from 'next/link';

export function SubscriptionInfo({
    subscription,
    account
}: {
    subscription: any | null;
    account: any | null;
}) {
    const calcProgress = (used: number, total: number) => {
        return total > 0 ? (used / total) * 100 : 0;
    };

    // Handle free accounts (no subscription) or subscriptions without end date
    const date = subscription?.current_period_end ? new Date(subscription.current_period_end) : null;

    return (
        <Card className='border border-neutral-800 bg-neutral-900'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium'>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='flex justify-between items-center mb-6'>
                    <div className='flex items-center space-x-2'>
                        <div className='bg-gradient-to-r from-amber-500 to-amber-300 rounded-full p-1.5'>
                            <IconCrown className='h-4 w-4 text-black' />
                        </div>
                        <div>
                            <div className='text-base font-medium'>{subscription?.plan_name || account?.plan || 'Free'}</div>
                            <div className='text-xs text-neutral-400'>
                                renews on{' '}
                                <span className='text-amber-400'>
                                    {(!subscription || subscription.plan_name === 'Free' || !date)
                                        ? 'N/A'
                                        : date.toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button variant='outline' size='sm' asChild>
                        <Link href='/dashboard/settings'>Manage</Link>
                    </Button>
                </div>

                <div className='space-y-3'>
                    <div className='flex justify-between text-xs'>
                        <span>Email Scans</span>
                        <span>
                            {subscription?.analysis_used || (100 - (account?.emails_left || 100))} / {subscription?.analysis_amount || 100}
                        </span>
                    </div>
                    <Progress
                        value={calcProgress(
                            subscription?.analysis_used || (100 - (account?.emails_left || 100)),
                            subscription?.analysis_amount || 100
                        )}
                        className='h-2'
                    />

                    <div className='flex justify-between text-xs mt-4'>
                        <span>Team Members</span>
                        <span>1 / {subscription?.seats || 1}</span>
                    </div>
                    <Progress value={subscription?.seats ? (1 / subscription.seats) * 100 : 100} className='h-2' />
                </div>

                <div className='mt-6 pt-6 border-t border-neutral-800'>
                    <div className='flex justify-between items-center'>
                        <div className='text-sm'>Need more capacity?</div>
                        <Button size='sm' asChild>
                            <Link href='/dashboard/settings'>Upgrade</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
