'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/use-toast';
import { IconClock, IconCheck, IconArrowRight, IconRefresh } from '@tabler/icons-react';

type SubscriptionStatusProps = {
    currentPlan: string;
    currentSeats: number;
    periodEnd: string;
    accountId: string;
    onStatusChange?: () => void;
};

export function SubscriptionStatusBanner({
    currentPlan,
    currentSeats,
    periodEnd,
    accountId,
    onStatusChange,
}: SubscriptionStatusProps) {
    const [pendingChanges, setPendingChanges] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(false);
    const { toast } = useToast();

    // Don't show banner for free plans
    const isFreeplan = currentPlan?.toLowerCase() === 'free';

    const periodEndDate = new Date(periodEnd);
    const daysUntilRenewal = Math.ceil(
        (periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const isNearRenewal = daysUntilRenewal <= 7 && !isFreeplan;

    // Check for pending subscription changes
    useEffect(() => {
        // Disabled: API endpoint doesn't exist and causes 404 errors
        // checkPendingChanges();
        // Check every 5 minutes for changes
        // const interval = setInterval(checkPendingChanges, 5 * 60 * 1000);
        // return () => clearInterval(interval);
    }, [accountId]);

    const checkPendingChanges = async () => {
        // Disabled: This API endpoint doesn't exist and causes 404 errors
        return;

        /*
        try {
            setIsChecking(true);

            const response = await fetch('/api/debug/sync-advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountId: accountId,
                    forceImmediate: false,
                }),
            });

            const result = await response.json();

            if (result.success && result.analysis) {
                const { analysis } = result;

                if (analysis.scheduled_subscriptions > 0 || analysis.total_subscriptions > 1) {
                    setPendingChanges({
                        hasScheduled: analysis.scheduled_subscriptions > 0,
                        totalSubscriptions: analysis.total_subscriptions,
                        scheduledPlans: result.all_subscriptions?.filter(
                            (sub: any) => sub.subscription_status !== 'active'
                        ),
                    });
                } else {
                    setPendingChanges(null);
                }
            }
        } catch (error) {
            console.error('Error checking pending changes:', error);
        } finally {
            setIsChecking(false);
        }
        */
    };

    const handleApplyImmediately = async () => {
        // Disabled: This API endpoint doesn't exist and causes 404 errors
        toast({
            variant: 'destructive',
            title: 'Feature unavailable',
            description: 'This feature is currently disabled.',
        });
        return;

        /*
        try {
            const response = await fetch('/api/debug/sync-advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountId: accountId,
                    forceImmediate: true,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: 'Upgrade applied!',
                    description: `Your subscription has been upgraded immediately.`,
                });

                // Refresh the page to show new data
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Failed to apply upgrade',
                    description: result.error || 'Could not apply the upgrade immediately.',
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not process the immediate upgrade.',
            });
        }
        */
    };

    // Show pending changes banner (but not for free plans)
    if (pendingChanges?.hasScheduled && !isFreeplan) {
        const scheduledPlan = pendingChanges.scheduledPlans?.[0];

        return (
            <Card className='border-blue-700 bg-blue-950/20 mb-6'>
                <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <div className='bg-blue-900/50 p-2 rounded-md'>
                                <IconClock className='h-5 w-5 text-blue-400' />
                            </div>
                            <div>
                                <div className='font-medium text-blue-300'>
                                    Subscription Upgrade Pending
                                </div>
                                <div className='text-sm text-blue-400/80'>
                                    Your upgrade to {scheduledPlan?.plan || 'new plan'} will take
                                    effect on {periodEndDate.toLocaleDateString()} (
                                    {daysUntilRenewal} days)
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                className='border-blue-600 text-blue-400 hover:bg-blue-950/30'
                                onClick={handleApplyImmediately}
                            >
                                <IconCheck className='h-4 w-4 mr-1' />
                                Apply Now
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={checkPendingChanges}
                                disabled={isChecking}
                            >
                                <IconRefresh
                                    className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`}
                                />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show near-renewal banner for active subscriptions
    if (isNearRenewal && !pendingChanges) {
        return (
            <Card className='border-amber-700 bg-amber-950/20 mb-6'>
                <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                            <div className='bg-amber-900/50 p-2 rounded-md'>
                                <IconClock className='h-5 w-5 text-amber-400' />
                            </div>
                            <div>
                                <div className='font-medium text-amber-300'>
                                    Subscription Renewal Soon
                                </div>
                                <div className='text-sm text-amber-400/80'>
                                    Your {currentPlan} plan will renew in {daysUntilRenewal} day
                                    {daysUntilRenewal !== 1 ? 's' : ''} on{' '}
                                    {periodEndDate.toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Badge variant='outline' className='border-amber-600 text-amber-400'>
                                {currentSeats} seats
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
