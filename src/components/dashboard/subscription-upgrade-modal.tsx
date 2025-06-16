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
import {
    IconCheck,
    IconClock,
    IconAlertTriangle,
    IconCreditCard,
    IconArrowUp,
    IconArrowDown,
} from '@tabler/icons-react';

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

// Define plan hierarchy (higher number = higher tier)
const getPlanTier = (planName: string): number => {
    const tiers: Record<string, number> = {
        Free: 0,
        Solo: 1,
        Entrepreneur: 2,
        Team: 3,
    };
    return tiers[planName] || 0;
};

// Determine if it's an upgrade or downgrade
const isUpgrade = (currentPlan: string, targetPlan: string): boolean => {
    return getPlanTier(targetPlan) > getPlanTier(currentPlan);
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
    const daysUntilRenewal = Math.ceil(
        (periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const isUpgradeAction = isUpgrade(currentPlan, targetPlan);
    const actionText = isUpgradeAction ? 'Upgrade' : 'Downgrade';
    const actionIcon = isUpgradeAction ? IconArrowUp : IconArrowDown;

    // Free plan upgrades are always immediate (no billing period to respect)
    const isFreePlan = currentPlan === 'Free';
    const shouldForceImmediate = isFreePlan && isUpgradeAction;

    const handleUpgrade = async () => {
        // For Free plan upgrades, always use immediate (no billing period to respect)
        if (shouldForceImmediate) {
            await handleImmediateUpgrade();
            return;
        }

        // For downgrades, use scheduled approach (at end of billing period)
        // Customer should get full value of current plan until period ends
        if (!isUpgradeAction) {
            await handleScheduledDowngrade();
            return;
        }

        // For paid plan upgrades, use the selected option
        if (upgradeOption === 'immediate') {
            await handleImmediateUpgrade();
        } else {
            await handleScheduledUpgrade();
        }
    };

    const handleImmediateUpgrade = async () => {
        startTransition(async () => {
            try {
                console.log('🚀 Starting upgrade:', {
                    targetPriceId,
                    accountId,
                    targetPlan,
                    accountIdType: typeof accountId,
                    accountIdLength: accountId ? accountId.length : 'null',
                });

                toast({
                    title: `Processing ${actionText.toLowerCase()}...`,
                    description: `Updating your subscription with immediate access.`,
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

                console.log('📡 API Response status:', response.status);
                console.log(
                    '📡 API Response headers:',
                    Object.fromEntries(response.headers.entries())
                );
                console.log('📡 API Response ok:', response.ok);

                let result;
                try {
                    const responseText = await response.text();
                    console.log('📡 Raw response text:', responseText);
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('❌ Failed to parse response as JSON:', parseError);
                    result = { error: 'Invalid response format', details: responseText };
                }
                console.log('📋 Parsed API Response data:', result);

                if (result.success) {
                    toast({
                        title: `${actionText} successful!`,
                        description: `Welcome to ${targetPlan}! Refreshing page to show changes...`,
                        duration: 2000,
                    });
                    setShowUpgradeDialog(false);

                    // Add delay to show success message before refreshing
                    setTimeout(() => {
                        console.log(`🔄 ${actionText} success - refreshing page`);
                        onUpgradeComplete?.();
                    }, 1500);
                } else if (result.needsCheckout) {
                    // No payment method found, redirect to checkout
                    console.log('💳 No payment method, redirecting to checkout...');
                    toast({
                        title: 'Payment method required',
                        description: 'Redirecting to secure checkout to add payment method...',
                    });
                    setShowUpgradeDialog(false);
                    // Use checkout flow instead
                    await handleScheduledUpgrade();
                } else {
                    console.error(`❌ ${actionText} API returned error:`, result);

                    // Handle specific error cases
                    if (result.needsSetup || result.needsSync) {
                        toast({
                            variant: 'destructive',
                            title: `Setup required`,
                            description: result.message || 'Please sync your subscription first.',
                        });
                    } else {
                        toast({
                            variant: 'destructive',
                            title: `${actionText} failed`,
                            description: result.details
                                ? `${result.error}: ${result.details}`
                                : result.message ||
                                  result.error ||
                                  `Could not process the ${actionText.toLowerCase()}.`,
                        });
                    }
                }
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: `${actionText} error`,
                    description:
                        error?.message ||
                        `Could not connect to ${actionText.toLowerCase()} service.`,
                });
            }
        });
    };

    const handleScheduledUpgrade = async () => {
        startTransition(async () => {
            try {
                toast({
                    title: `Scheduling ${actionText.toLowerCase()}...`,
                    description: `Your ${actionText.toLowerCase()} will take effect at your next billing cycle.`,
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
                    const stripe = await (window as any).Stripe(
                        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                    );
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

    const handleScheduledDowngrade = async () => {
        startTransition(async () => {
            try {
                toast({
                    title: 'Scheduling downgrade...',
                    description: `Your plan will change to ${targetPlan} at the end of your current billing period.`,
                });

                // For downgrades, we need to schedule the change without requiring payment
                // Use Stripe's subscription schedule or immediate update with proration_behavior
                const response = await fetch('/api/stripe/schedule-downgrade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        newPriceId: targetPriceId,
                        accountId: accountId,
                        effectiveDate: currentPeriodEnd, // Schedule for end of current period
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    toast({
                        title: 'Downgrade scheduled!',
                        description: `Your plan will change to ${targetPlan} on ${new Date(currentPeriodEnd).toLocaleDateString()}. Refreshing page...`,
                        duration: 3000,
                    });
                    setShowUpgradeDialog(false);

                    // Refresh page to show scheduled downgrade
                    setTimeout(() => {
                        console.log('🔄 Downgrade scheduled - refreshing page');
                        onUpgradeComplete?.();
                    }, 2000);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Downgrade failed',
                        description: result.error || 'Could not schedule downgrade.',
                    });
                }
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Downgrade error',
                    description: error?.message || 'Could not schedule downgrade.',
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
                {actionText} to {targetPlan}
            </Button>

            <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <AlertDialogContent className='max-w-2xl'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center space-x-2'>
                            <IconCreditCard className='h-5 w-5' />
                            <span>{actionText} Subscription</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {isUpgradeAction
                                ? shouldForceImmediate
                                    ? `Upgrade from ${currentPlan} to ${targetPlan} with immediate access`
                                    : `Choose how you'd like to upgrade from ${currentPlan} to ${targetPlan}`
                                : `Your plan will change from ${currentPlan} to ${targetPlan} at the end of your billing period`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className='space-y-4 py-4'>
                        {/* Current vs New Plan Comparison */}
                        <div className='grid grid-cols-2 gap-4'>
                            <Card className='border-neutral-700'>
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-sm text-neutral-400'>
                                        Current Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-1'>
                                        <div className='font-medium'>{currentPlan}</div>
                                        <div className='text-sm text-neutral-400'>
                                            {currentSeats} team members
                                        </div>
                                        <Badge variant='outline'>
                                            {isFreePlan
                                                ? 'Always Active'
                                                : `Active until ${periodEndDate.toLocaleDateString()}`}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className={`${isUpgradeAction ? 'border-green-700 bg-green-950/20' : 'border-amber-700 bg-amber-950/20'}`}
                            >
                                <CardHeader className='pb-2'>
                                    <CardTitle
                                        className={`text-sm ${isUpgradeAction ? 'text-green-400' : 'text-amber-400'}`}
                                    >
                                        New Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-1'>
                                        <div className='font-medium'>{targetPlan}</div>
                                        <div className='text-sm text-neutral-400'>
                                            {targetSeats} team members
                                        </div>
                                        <Badge
                                            className={`${isUpgradeAction ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}`}
                                        >
                                            {isUpgradeAction
                                                ? `+${targetSeats - currentSeats} more seats`
                                                : `${currentSeats - targetSeats} fewer seats`}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {isUpgradeAction ? (
                            /* Upgrade Options */
                            <div className='space-y-3'>
                                {!shouldForceImmediate && (
                                    <h4 className='font-medium'>Choose upgrade timing:</h4>
                                )}

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
                                                <div
                                                    className={`w-4 h-4 rounded-full border-2 ${
                                                        upgradeOption === 'immediate'
                                                            ? 'border-blue-500 bg-blue-500'
                                                            : 'border-neutral-400'
                                                    }`}
                                                >
                                                    {upgradeOption === 'immediate' && (
                                                        <IconCheck className='w-2 h-2 text-white m-0.5' />
                                                    )}
                                                </div>
                                            </div>
                                            <div className='flex-1'>
                                                <div className='flex items-center space-x-2'>
                                                    <h5 className='font-medium'>
                                                        Immediate Upgrade
                                                    </h5>
                                                    <Badge className='bg-green-900/30 text-green-400'>
                                                        Recommended
                                                    </Badge>
                                                </div>
                                                <p className='text-sm text-neutral-400 mt-1'>
                                                    {shouldForceImmediate
                                                        ? `Start using ${targetPlan} features right away. You'll be redirected to secure checkout to set up billing.`
                                                        : `Start using ${targetPlan} features right away. You'll be charged a prorated amount for the remaining ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''} of your current billing cycle. If no payment method is found, you'll be redirected to secure checkout.`}
                                                </p>
                                                <div className='flex items-center space-x-1 mt-2 text-xs text-green-400'>
                                                    <IconCheck className='w-3 h-3' />
                                                    <span>
                                                        Immediate access to {targetSeats} team
                                                        member{targetSeats !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Scheduled Upgrade Option - Only for paid plans */}
                                {!shouldForceImmediate && (
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
                                                    <div
                                                        className={`w-4 h-4 rounded-full border-2 ${
                                                            upgradeOption === 'scheduled'
                                                                ? 'border-blue-500 bg-blue-500'
                                                                : 'border-neutral-400'
                                                        }`}
                                                    >
                                                        {upgradeOption === 'scheduled' && (
                                                            <IconCheck className='w-2 h-2 text-white m-0.5' />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='flex-1'>
                                                    <div className='flex items-center space-x-2'>
                                                        <h5 className='font-medium'>
                                                            Scheduled Upgrade
                                                        </h5>
                                                        <Badge variant='outline'>
                                                            Wait for renewal
                                                        </Badge>
                                                    </div>
                                                    <p className='text-sm text-neutral-400 mt-1'>
                                                        Upgrade will take effect on{' '}
                                                        {periodEndDate.toLocaleDateString()} when
                                                        your current plan renews. No additional
                                                        charges until then.
                                                    </p>
                                                    <div className='flex items-center space-x-1 mt-2 text-xs text-amber-400'>
                                                        <IconClock className='w-3 h-3' />
                                                        <span>
                                                            Access to new features in{' '}
                                                            {daysUntilRenewal} day
                                                            {daysUntilRenewal !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Warning for immediate upgrade - Only for paid plans */}
                                {upgradeOption === 'immediate' && !shouldForceImmediate && (
                                    <div className='flex items-start space-x-2 p-3 bg-amber-950/20 border border-amber-900/50 rounded-md'>
                                        <IconAlertTriangle className='w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0' />
                                        <div className='text-sm text-amber-300'>
                                            <strong>Prorated billing:</strong> You'll be charged
                                            immediately for the upgrade, with credit applied for
                                            unused time on your current plan.
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Downgrade Information - No Options, Always Scheduled */
                            <div className='space-y-3'>
                                <h4 className='font-medium'>Downgrade Details:</h4>

                                <Card className='border-amber-700 bg-amber-950/20'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-start space-x-3'>
                                            <IconClock className='h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0' />
                                            <div className='flex-1'>
                                                <h5 className='font-medium text-amber-300'>
                                                    Scheduled for{' '}
                                                    {periodEndDate.toLocaleDateString()}
                                                </h5>
                                                <p className='text-sm text-neutral-400 mt-1'>
                                                    Your plan will change to {targetPlan} when your
                                                    current billing period ends. You'll keep access
                                                    to all {currentPlan} features until then.
                                                </p>
                                                <div className='flex items-center space-x-1 mt-2 text-xs text-amber-400'>
                                                    <IconCheck className='w-3 h-3' />
                                                    <span>
                                                        No immediate changes to your service
                                                    </span>
                                                </div>
                                                <div className='flex items-center space-x-1 mt-1 text-xs text-amber-400'>
                                                    <IconCheck className='w-3 h-3' />
                                                    <span>
                                                        Keep all features for {daysUntilRenewal}{' '}
                                                        more day{daysUntilRenewal !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className='flex items-start space-x-2 p-3 bg-blue-950/20 border border-blue-900/50 rounded-md'>
                                    <IconCheck className='w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0' />
                                    <div className='text-sm text-blue-300'>
                                        <strong>Fair billing:</strong> You'll continue to have
                                        access to all your current features until your billing
                                        period ends. No immediate charges or loss of functionality.
                                    </div>
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
                            {isPending
                                ? 'Processing...'
                                : isUpgradeAction
                                  ? shouldForceImmediate
                                      ? 'Upgrade Now'
                                      : upgradeOption === 'immediate'
                                        ? 'Upgrade Now'
                                        : 'Schedule Upgrade'
                                  : 'Schedule Downgrade'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
