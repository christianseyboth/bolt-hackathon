'use client';
import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { IconCheck, IconClock, IconAlertTriangle, IconCreditCard } from '@tabler/icons-react';

type SubscriptionUpgradeProps = {
    currentPlan: string;
    currentSeats: number;
    targetPlan: string;
    targetSeats: number;
    targetPriceId: string;
    accountId: string;
    currentPeriodEnd: string;
    onUpgradeComplete?: () => void;
};

export function SubscriptionUpgradeModal({
    currentPlan,
    currentSeats,
    targetPlan,
    targetSeats,
    targetPriceId,
    accountId,
    currentPeriodEnd,
    onUpgradeComplete,
}: SubscriptionUpgradeProps) {
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [upgradeOption, setUpgradeOption] = useState<'immediate' | 'scheduled'>('immediate');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const periodEndDate = new Date(currentPeriodEnd);
    const daysUntilRenewal = Math.ceil((periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const handleUpgrade = async () => {
        if (upgradeOption === 'immediate') {
            await handleImmediateUpgrade();
        } else {
            await handleScheduledUpgrade();
        }
    };

    const handleImmediateUpgrade = async () => {
        startTransition(async () => {
            try {
                toast({
                    title: 'Processing upgrade...',
                    description: 'Updating your subscription with immediate access.',
                });

                const response = await fetch('/api/stripe/upgrade-subscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        newPriceId: targetPriceId,
                        accountId: accountId,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    toast({
                        title: 'Upgrade successful!',
                        description: `Welcome to ${targetPlan}! You now have ${targetSeats} seats available.`,
                    });
                    setShowUpgradeDialog(false);
                    onUpgradeComplete?.();
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Upgrade failed',
                        description: result.error || 'Could not process the upgrade.',
                    });
                }
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Upgrade error',
                    description: error?.message || 'Could not connect to upgrade service.',
                });
            }
        });
    };

    const handleScheduledUpgrade = async () => {
        startTransition(async () => {
            try {
                toast({
                    title: 'Scheduling upgrade...',
                    description: 'Your upgrade will take effect at your next billing cycle.',
                });

                // Use regular checkout session for scheduled upgrade
                const response = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        priceId: targetPriceId,
                        accountId: accountId,
                    }),
                });

                const result = await response.json();

                if (result.sessionId) {
                    // Redirect to Stripe checkout
                    const stripe = await (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
                    await stripe.redirectToCheckout({ sessionId: result.sessionId });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Checkout failed',
                        description: result.error || 'Could not create checkout session.',
                    });
                }
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Checkout error',
                    description: error?.message || 'Could not start checkout process.',
                });
            }
        });
    };

    return (
        <>
            <Button
                onClick={() => setShowUpgradeDialog(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white'
            >
                Upgrade to {targetPlan}
            </Button>

            <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <AlertDialogContent className='max-w-2xl'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center space-x-2'>
                            <IconCreditCard className='h-5 w-5' />
                            <span>Upgrade Subscription</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Choose how you'd like to upgrade from {currentPlan} to {targetPlan}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className='space-y-4 py-4'>
                        {/* Current vs New Plan Comparison */}
                        <div className='grid grid-cols-2 gap-4'>
                            <Card className='border-neutral-700'>
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-sm text-neutral-400'>Current Plan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-1'>
                                        <div className='font-medium'>{currentPlan}</div>
                                        <div className='text-sm text-neutral-400'>{currentSeats} team members</div>
                                        <Badge variant='outline'>Active until {periodEndDate.toLocaleDateString()}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className='border-green-700 bg-green-950/20'>
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-sm text-green-400'>New Plan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-1'>
                                        <div className='font-medium'>{targetPlan}</div>
                                        <div className='text-sm text-neutral-400'>{targetSeats} team members</div>
                                        <Badge className='bg-green-900/30 text-green-400'>
                                            +{targetSeats - currentSeats} more seats
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Upgrade Options */}
                        <div className='space-y-3'>
                            <h4 className='font-medium'>Choose upgrade timing:</h4>

                            {/* Immediate Upgrade Option */}
                            <Card
                                className={`cursor-pointer border-2 transition-colors ${
                                    upgradeOption === 'immediate'
                                        ? 'border-blue-500 bg-blue-950/20'
                                        : 'border-neutral-700 hover:border-neutral-600'
                                }`}
                                onClick={() => setUpgradeOption('immediate')}
                            >
                                <CardContent className='p-4'>
                                    <div className='flex items-start space-x-3'>
                                        <div className='mt-1'>
                                            <div className={`w-4 h-4 rounded-full border-2 ${
                                                upgradeOption === 'immediate'
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-neutral-400'
                                            }`}>
                                                {upgradeOption === 'immediate' && (
                                                    <IconCheck className='w-2 h-2 text-white m-0.5' />
                                                )}
                                            </div>
                                        </div>
                                        <div className='flex-1'>
                                            <div className='flex items-center space-x-2'>
                                                <h5 className='font-medium'>Immediate Upgrade</h5>
                                                <Badge className='bg-green-900/30 text-green-400'>Recommended</Badge>
                                            </div>
                                            <p className='text-sm text-neutral-400 mt-1'>
                                                Start using {targetPlan} features right away. You'll be charged a prorated amount
                                                for the remaining {daysUntilRenewal} days of your current billing cycle.
                                            </p>
                                            <div className='flex items-center space-x-1 mt-2 text-xs text-green-400'>
                                                <IconCheck className='w-3 h-3' />
                                                <span>Immediate access to {targetSeats} team members</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Scheduled Upgrade Option */}
                            <Card
                                className={`cursor-pointer border-2 transition-colors ${
                                    upgradeOption === 'scheduled'
                                        ? 'border-blue-500 bg-blue-950/20'
                                        : 'border-neutral-700 hover:border-neutral-600'
                                }`}
                                onClick={() => setUpgradeOption('scheduled')}
                            >
                                <CardContent className='p-4'>
                                    <div className='flex items-start space-x-3'>
                                        <div className='mt-1'>
                                            <div className={`w-4 h-4 rounded-full border-2 ${
                                                upgradeOption === 'scheduled'
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-neutral-400'
                                            }`}>
                                                {upgradeOption === 'scheduled' && (
                                                    <IconCheck className='w-2 h-2 text-white m-0.5' />
                                                )}
                                            </div>
                                        </div>
                                        <div className='flex-1'>
                                            <div className='flex items-center space-x-2'>
                                                <h5 className='font-medium'>Scheduled Upgrade</h5>
                                                <Badge variant='outline'>Wait for renewal</Badge>
                                            </div>
                                            <p className='text-sm text-neutral-400 mt-1'>
                                                Upgrade will take effect on {periodEndDate.toLocaleDateString()} when
                                                your current plan renews. No additional charges until then.
                                            </p>
                                            <div className='flex items-center space-x-1 mt-2 text-xs text-amber-400'>
                                                <IconClock className='w-3 h-3' />
                                                <span>Access to new features in {daysUntilRenewal} days</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Warning for immediate upgrade */}
                        {upgradeOption === 'immediate' && (
                            <div className='flex items-start space-x-2 p-3 bg-amber-950/20 border border-amber-900/50 rounded-md'>
                                <IconAlertTriangle className='w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0' />
                                <div className='text-sm text-amber-300'>
                                    <strong>Prorated billing:</strong> You'll be charged immediately for the upgrade,
                                    with credit applied for unused time on your current plan.
                                </div>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowUpgradeDialog(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUpgrade}
                            disabled={isPending}
                            className='bg-blue-600 hover:bg-blue-700'
                        >
                            {isPending ? 'Processing...' : (
                                upgradeOption === 'immediate' ? 'Upgrade Now' : 'Schedule Upgrade'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
