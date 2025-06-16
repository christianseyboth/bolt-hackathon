'use client';
import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { IconUsers, IconRefresh } from '@tabler/icons-react';

type Subscription = {
    id: string;
    plan_name: string;
    subscription_status: string;
    seats: number;
    created_at: string;
    updated_at: string;
    stripe_subscription_id: string;
};

type SubscriptionDebugProps = {
    initialSubscriptions: Subscription[];
    initialCurrentSubscription: Subscription | null;
    activeSubscriptions: Subscription[];
    inactiveSubscriptions: Subscription[];
    account: any;
};

export function SubscriptionDebugClient({
    initialSubscriptions,
    initialCurrentSubscription,
    activeSubscriptions,
    inactiveSubscriptions,
    account,
}: SubscriptionDebugProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Handle manual subscription sync from Stripe
    const handleSyncSubscription = async () => {
        startTransition(async () => {
            try {
                toast({
                    title: 'Syncing subscription...',
                    description: 'Fetching latest subscription data from Stripe.',
                });

                const response = await fetch('/api/debug/sync-subscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        accountId: account.id,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    toast({
                        title: 'Subscription synced!',
                        description: `Updated to ${result.subscription.plan_name} plan. Refreshing page...`,
                    });
                    // Force a page refresh to show updated data
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Sync failed',
                        description: result.error || 'Could not sync subscription from Stripe.',
                    });
                }
            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Sync error',
                    description: err?.message || 'Could not connect to sync service.',
                });
            }
        });
    };

    // Handle advanced sync with all subscription detection
    const handleAdvancedSync = async (forceImmediate = false) => {
        startTransition(async () => {
            try {
                toast({
                    title: forceImmediate
                        ? 'Forcing immediate upgrade...'
                        : 'Analyzing all subscriptions...',
                    description: 'Checking for active and scheduled subscriptions.',
                });

                const response = await fetch('/api/debug/sync-advanced', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        accountId: account.id,
                        forceImmediate: forceImmediate,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    const { analysis } = result;
                    toast({
                        title: 'Advanced sync completed!',
                        description: `${result.message}. Found ${analysis.total_subscriptions} total subscriptions. Refreshing...`,
                    });

                    // Show detailed info
                    console.log('Advanced sync result:', result);

                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Advanced sync failed',
                        description: result.error || 'Could not analyze subscriptions.',
                    });

                    // Show detailed error info
                    if (result.allSubscriptions) {
                        console.log('All subscriptions found:', result.allSubscriptions);
                    }
                }
            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Advanced sync error',
                    description: err?.message || 'Could not connect to advanced sync service.',
                });
            }
        });
    };

    return (
        <div className='space-y-6'>
            {/* Sync Actions */}
            <Card className='border-purple-800 bg-purple-950/20'>
                <CardHeader>
                    <CardTitle className='text-lg text-purple-400'>Sync Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-wrap gap-3'>
                        <Button
                            variant='outline'
                            className='border-purple-700 text-purple-400 hover:bg-purple-950/30'
                            onClick={handleSyncSubscription}
                            disabled={isPending}
                        >
                            <IconRefresh className='h-4 w-4 mr-2' />
                            {isPending ? 'Syncing...' : 'Standard Sync'}
                        </Button>
                        <Button
                            variant='outline'
                            className='border-cyan-700 text-cyan-400 hover:bg-cyan-950/30'
                            onClick={() => handleAdvancedSync(false)}
                            disabled={isPending}
                        >
                            <IconUsers className='h-4 w-4 mr-2' />
                            {isPending ? 'Analyzing...' : 'Analyze All Subscriptions'}
                        </Button>
                        <Button
                            variant='outline'
                            className='border-yellow-700 text-yellow-400 hover:bg-yellow-950/30'
                            onClick={() => handleAdvancedSync(true)}
                            disabled={isPending}
                        >
                            <IconRefresh className='h-4 w-4 mr-2' />
                            {isPending ? 'Forcing...' : 'Force Immediate Upgrade'}
                        </Button>
                        <Button
                            variant='outline'
                            className='border-orange-700 text-orange-400 hover:bg-orange-950/30'
                            onClick={() => {
                                // Force hard refresh - clears all caches
                                window.location.href = window.location.href + '?t=' + Date.now();
                            }}
                        >
                            <IconRefresh className='h-4 w-4 mr-2' />
                            Hard Refresh
                        </Button>
                    </div>
                    <div className='text-sm text-neutral-400 mt-3 space-y-1'>
                        <p>
                            <strong>Standard Sync:</strong> Gets currently active subscription (may
                            be old plan until period ends)
                        </p>
                        <p>
                            <strong>Analyze All:</strong> Shows all subscriptions (active +
                            scheduled) without changes
                        </p>
                        <p>
                            <strong>Force Immediate:</strong> ⚠️ Immediately switches to new plan
                            (cancels old subscription)
                        </p>
                        <p>
                            <strong>Hard Refresh:</strong> Clears browser cache if data seems stale
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Current Active Subscription */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='text-lg text-green-400'>
                        Current Active Subscription
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {initialCurrentSubscription ? (
                        <div className='space-y-2'>
                            <div>
                                <strong>ID:</strong> {initialCurrentSubscription.id}
                            </div>
                            <div>
                                <strong>Plan:</strong>{' '}
                                {initialCurrentSubscription.plan_name || 'N/A'}
                            </div>
                            <div>
                                <strong>Status:</strong>{' '}
                                <Badge
                                    className={
                                        initialCurrentSubscription.subscription_status === 'active'
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-red-900/30 text-red-400'
                                    }
                                >
                                    {initialCurrentSubscription.subscription_status}
                                </Badge>
                            </div>
                            <div>
                                <strong>Seats:</strong> {initialCurrentSubscription.seats}
                            </div>
                            <div>
                                <strong>Created:</strong>{' '}
                                {new Date(initialCurrentSubscription.created_at).toLocaleString()}
                            </div>
                            <div>
                                <strong>Updated:</strong>{' '}
                                {new Date(initialCurrentSubscription.updated_at).toLocaleString()}
                            </div>
                            <div>
                                <strong>Stripe Subscription ID:</strong>{' '}
                                {initialCurrentSubscription.stripe_subscription_id || 'N/A'}
                            </div>
                        </div>
                    ) : (
                        <div className='text-red-400'>
                            No subscription found. Try syncing from Stripe above.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* All Subscriptions */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='text-lg'>
                        All Subscriptions ({initialSubscriptions.length} total)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {initialSubscriptions.length > 0 ? (
                        <div className='space-y-4'>
                            {initialSubscriptions.map((subscription, index) => (
                                <div
                                    key={subscription.id}
                                    className={`p-4 rounded-lg border ${
                                        subscription.subscription_status === 'active'
                                            ? 'border-green-700 bg-green-950/20'
                                            : 'border-neutral-700 bg-neutral-950/20'
                                    }`}
                                >
                                    <div className='flex justify-between items-start mb-2'>
                                        <h4 className='font-medium'>Subscription #{index + 1}</h4>
                                        <Badge
                                            className={
                                                subscription.subscription_status === 'active'
                                                    ? 'bg-green-900/30 text-green-400'
                                                    : 'bg-red-900/30 text-red-400'
                                            }
                                        >
                                            {subscription.subscription_status}
                                        </Badge>
                                    </div>
                                    <div className='grid grid-cols-2 gap-2 text-sm'>
                                        <div>
                                            <strong>ID:</strong> {subscription.id}
                                        </div>
                                        <div>
                                            <strong>Plan:</strong> {subscription.plan_name || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Seats:</strong> {subscription.seats}
                                        </div>
                                        <div>
                                            <strong>Stripe ID:</strong>{' '}
                                            {subscription.stripe_subscription_id || 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Created:</strong>{' '}
                                            {new Date(subscription.created_at).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <strong>Updated:</strong>{' '}
                                            {new Date(subscription.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-neutral-400'>No subscriptions found.</div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='text-lg'>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <div className='text-sm text-neutral-400'>Total Subscriptions</div>
                            <div className='text-2xl font-bold'>{initialSubscriptions.length}</div>
                        </div>
                        <div>
                            <div className='text-sm text-neutral-400'>Active Subscriptions</div>
                            <div className='text-2xl font-bold text-green-400'>
                                {activeSubscriptions.length}
                            </div>
                        </div>
                        <div>
                            <div className='text-sm text-neutral-400'>Inactive Subscriptions</div>
                            <div className='text-2xl font-bold text-red-400'>
                                {inactiveSubscriptions.length}
                            </div>
                        </div>
                        <div>
                            <div className='text-sm text-neutral-400'>Current Plan Seats</div>
                            <div className='text-2xl font-bold text-cyan-400'>
                                {initialCurrentSubscription?.seats || 0}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Info */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='text-lg'>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-2'>
                        <div>
                            <strong>Account ID:</strong> {account.id}
                        </div>
                        <div>
                            <strong>Owner ID:</strong> {account.owner_id}
                        </div>
                        <div>
                            <strong>Stripe Customer ID:</strong>{' '}
                            {account.stripe_customer_id || 'N/A'}
                        </div>
                        <div>
                            <strong>Account Plan:</strong> {account.plan || 'N/A'}
                        </div>
                        <div>
                            <strong>Account Subscription Status:</strong>{' '}
                            {account.susbscription_status || 'N/A'}
                        </div>
                        <div>
                            <strong>Created:</strong>{' '}
                            {new Date(account.created_at).toLocaleString()}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
