'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Badge } from '../ui/badge';
import {
    IconCreditCard,
    IconCrown,
    IconCheck,
    IconLoader,
    IconStar,
    IconShield,
    IconBolt,
    IconUsers,
    IconClock,
} from '@tabler/icons-react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { SubscriptionUpgradeModal } from './subscription-upgrade-modal';
import { SubscriptionCancelModal } from './subscription-cancel-modal';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Plan {
    id: string;
    name: string;
    description: string;
    metadata: Record<string, string>;
    prices: {
        id: string;
        amount: number;
        currency: string;
        interval: string | null;
        interval_count: number | null;
    }[];
}

interface SubscriptionBillingProps {
    products: Plan[];
    currentSubscription: any;
    account: any;
    shouldAutoSync?: boolean;
    autoSyncReason?: string;
}

export function SubscriptionBilling({
    products,
    currentSubscription,
    account,
    shouldAutoSync,
    autoSyncReason,
}: SubscriptionBillingProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [hasAutoSynced, setHasAutoSynced] = useState(false);
    const [lastAutoSyncTime, setLastAutoSyncTime] = useState<string>('Never');
    const { toast } = useToast();
    const [isAutoSyncing, setIsAutoSyncing] = useState(false);

    // Set last auto-sync time on client mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lastSync = sessionStorage.getItem('lastAutoSync');
            if (lastSync) {
                setLastAutoSyncTime(new Date(parseInt(lastSync)).toLocaleTimeString());
            }

            // Check if user just returned from Stripe checkout
            const urlParams = new URLSearchParams(window.location.search);
            const checkoutSuccess = urlParams.get('success');
            const checkoutCanceled = urlParams.get('canceled');

            if (checkoutSuccess === 'true') {
                console.log(
                    '🎉 Returned from successful checkout, refreshing subscription data...'
                );
                toast({
                    title: 'Payment successful!',
                    description: 'Updating your subscription status...',
                });

                // Clear the URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);

                // Trigger auto-sync after a short delay
                setTimeout(() => {
                    handleAutoSync();
                }, 2000);
            } else if (checkoutCanceled === 'true') {
                console.log('❌ Checkout was canceled');
                toast({
                    title: 'Checkout canceled',
                    description: 'Your subscription was not changed.',
                    variant: 'destructive',
                });

                // Clear the URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, []);

    // Check if auto-sync should run based on server recommendation
    const shouldAutoSyncFromServer = shouldAutoSync && typeof window !== 'undefined';

    // Auto-sync effect
    useEffect(() => {
        if (shouldAutoSyncFromServer) {
            console.log('🎯 Server recommended auto-sync:', autoSyncReason);

            // Delay auto-sync slightly to allow page to load
            const timer = setTimeout(() => {
                handleAutoSync();
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [shouldAutoSyncFromServer, autoSyncReason]);

    // Debug logging
    console.log('SubscriptionBilling received products:', products?.length || 0);
    console.log('Products data:', products);
    console.log(
        '🔍 FULL Current subscription object:',
        JSON.stringify(currentSubscription, null, 2)
    );
    console.log('🔍 Subscription status:', currentSubscription?.subscription_status);
    console.log('🔍 Subscription cancel_at_period_end:', currentSubscription?.cancel_at_period_end);
    console.log(
        '🔍 Should show "Ends on"?',
        currentSubscription?.subscription_status === 'cancelled' ||
            currentSubscription?.cancel_at_period_end
    );
    console.log(
        '🔍 All subscription keys:',
        currentSubscription ? Object.keys(currentSubscription) : 'No subscription'
    );
    console.log(
        '🔍 Current subscription stripe_subscription_id:',
        currentSubscription?.stripe_subscription_id
    );
    console.log('🔍 Auto-sync props:', { shouldAutoSync, autoSyncReason, hasAutoSynced });
    console.log('🔍 Account data being passed to components:', {
        account_id: account?.id,
        account_email: account?.email,
        account_type: typeof account?.id,
        account_length: account?.id ? account.id.length : 'null',
        full_account_keys: account ? Object.keys(account) : 'No account',
    });

    const handleSubscribe = async (priceId: string) => {
        setLoading(priceId);

        try {
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    accountId: account.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            const { sessionId } = data;

            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error('Stripe failed to load');
            }

            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description:
                    error instanceof Error ? error.message : 'Failed to start checkout process',
                variant: 'destructive',
            });
        } finally {
            setLoading(null);
        }
    };

    const handleManageBilling = async () => {
        setLoading('portal');

        try {
            const response = await fetch('/api/stripe/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountId: account.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Portal session error:', data);
                throw new Error(data.error || 'Failed to create portal session');
            }

            const { url } = data;

            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No portal URL received');
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description:
                    error instanceof Error ? error.message : 'Failed to open billing portal',
                variant: 'destructive',
            });
        } finally {
            setLoading(null);
        }
    };

    const handleAutoSync = async () => {
        if (isAutoSyncing) return;

        console.log('🎯 Auto-sync triggered');
        setIsAutoSyncing(true);

        try {
            // If subscription has no stripe_customer_id, use the after-checkout sync
            const syncEndpoint = !currentSubscription?.stripe_customer_id
                ? '/api/stripe/sync-after-checkout'
                : '/api/debug/sync-subscription';

            console.log('🔄 Using sync endpoint:', syncEndpoint);

            const response = await fetch(syncEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accountId: account.id }),
            });

            const result = await response.json();

            console.log('🔍 Sync response:', {
                status: response.status,
                ok: response.ok,
                result,
            });

            if (result.success) {
                toast({
                    title: 'Sync successful!',
                    description: 'Your subscription status has been updated.',
                });

                // Store the auto-sync time
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('lastAutoSync', Date.now().toString());
                    setLastAutoSyncTime(new Date().toLocaleTimeString());
                    setHasAutoSynced(true);
                }

                // Refresh the page after successful sync
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                console.error('Auto-sync failed:', result);
                toast({
                    title: 'Sync failed',
                    description: result.error || 'Failed to sync subscription status.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Auto-sync error:', error);
            toast({
                title: 'Sync error',
                description: 'Failed to sync subscription status.',
                variant: 'destructive',
            });
        } finally {
            setIsAutoSyncing(false);
        }
    };

    const handleSyncBillingInfo = async () => {
        setLoading('billing-sync');

        try {
            const response = await fetch('/api/stripe/sync-billing-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accountId: account.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to sync billing information');
            }

            toast({
                title: 'Billing info synced!',
                description: 'Your company information has been updated in Stripe for invoices.',
            });

            console.log('✅ Billing info synced:', data);
        } catch (error) {
            console.error('Error syncing billing info:', error);
            toast({
                title: 'Sync failed',
                description:
                    error instanceof Error ? error.message : 'Failed to sync billing information',
                variant: 'destructive',
            });
        } finally {
            setLoading(null);
        }
    };

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    // Default plan features for fallback
    const getDefaultFeatures = (planName: string) => {
        const defaultFeatures: Record<string, string[]> = {
            Solo: [
                'Up to 1,000 email analyses per month',
                'Real-time threat detection',
                'Basic AI analysis',
                'Email support',
                'Standard security rules',
                'Basic API access',
            ],
            Entrepreneur: [
                'Up to 5,000 email analyses per month',
                'Real-time threat detection',
                'Advanced AI analysis',
                'Priority email support',
                'Custom rules & policies',
                'Full API access',
                'Advanced reporting',
                'Team collaboration',
            ],
            Team: [
                'Up to 20,000 email analyses per month',
                'Real-time threat detection',
                'Advanced AI analysis',
                'Priority 24/7 support',
                'Custom rules & policies',
                'Full API access',
                'HIPAA compliance',
                'Dedicated account manager',
                'Custom integrations',
                'Multi-team management',
            ],
        };
        return defaultFeatures[planName] || [];
    };

    const getPlanIcon = (planName: string) => {
        switch (planName.toLowerCase()) {
            case 'solo':
                return <IconBolt className='h-5 w-5 text-blue-400' />;
            case 'entrepreneur':
                return <IconStar className='h-5 w-5 text-purple-400' />;
            case 'team':
                return <IconUsers className='h-5 w-5 text-emerald-400' />;
            default:
                return <IconUsers className='h-5 w-5 text-neutral-400' />;
        }
    };

    const getSeatsFromPlan = (planName: string): number => {
        const planSeats: Record<string, number> = {
            Free: 1,
            Solo: 1,
            Entrepreneur: 5,
            Team: 20,
        };

        return planSeats[planName] || 1;
    };

    // Clear session storage on successful manual sync
    const handleSyncComplete = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('autoSyncAttempted');
            const timestamp = Date.now().toString();
            sessionStorage.setItem('lastAutoSync', timestamp);
            setLastAutoSyncTime(new Date(parseInt(timestamp)).toLocaleTimeString());
        }
    };

    const handleManualRefresh = () => {
        toast({
            title: 'Refreshing subscription data...',
            description: 'Getting the latest information from Stripe.',
        });

        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    return (
        <div className='space-y-6'>
            {/* Auto-sync status banner */}
            {loading === 'auto-sync' && (
                <Card className='border-blue-500/50 bg-blue-950/20'>
                    <CardContent className='pt-6'>
                        <div className='flex items-center space-x-3'>
                            <IconLoader className='h-5 w-5 text-blue-400 animate-spin' />
                            <div>
                                <p className='text-blue-400 font-medium'>
                                    Updating subscription status...
                                </p>
                                <p className='text-blue-300/70 text-sm'>
                                    Fetching the latest data from Stripe
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Current Subscription Card */}
            {currentSubscription && (
                <Card className='border-neutral-800 bg-neutral-900'>
                    <CardHeader className='pb-3'>
                        <div className='flex items-center space-x-2'>
                            <div className='bg-gradient-to-r from-amber-500 to-amber-300 rounded-full p-1.5'>
                                <IconCrown className='h-4 w-4 text-black' />
                            </div>
                            <div>
                                <CardTitle className='text-lg'>Current Plan</CardTitle>
                                <CardDescription>
                                    {currentSubscription.plan_name} Subscription
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='flex justify-between items-start mb-4'>
                            <div>
                                <h3 className='text-lg font-semibold text-white'>
                                    Subscription Status
                                </h3>
                                <p className='text-zinc-400 text-sm'>
                                    Manage your subscription and billing
                                </p>
                            </div>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleManualRefresh}
                                className='text-zinc-300 border-zinc-600 hover:bg-zinc-700'
                                disabled={isAutoSyncing}
                            >
                                {isAutoSyncing ? (
                                    <>
                                        <Loader2 className='h-4 w-4 mr-1 animate-spin' />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className='h-4 w-4 mr-1' />
                                        Refresh
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className='flex justify-between items-center mb-4'>
                            <div className='flex items-center space-x-3'>
                                {getPlanIcon(currentSubscription.plan_name)}
                                <div>
                                    <h3 className='font-medium text-lg'>
                                        {currentSubscription.plan_name}
                                    </h3>
                                    <p className='text-sm text-neutral-400'>
                                        ${currentSubscription.total_price}/month
                                    </p>
                                </div>
                            </div>

                            {(() => {
                                const now = new Date();
                                const endDate = new Date(currentSubscription.current_period_end);
                                const isStillActive = endDate > now;
                                const isCancelledAtPeriodEnd =
                                    currentSubscription.cancel_at_period_end;

                                if (isCancelledAtPeriodEnd && isStillActive) {
                                    // Subscription is cancelled but still active until end date
                                    return (
                                        <Badge className='bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'>
                                            Active (Ending Soon)
                                        </Badge>
                                    );
                                } else if (isCancelledAtPeriodEnd && !isStillActive) {
                                    // Subscription has ended
                                    return (
                                        <Badge className='bg-red-500/20 text-red-400 hover:bg-red-500/30'>
                                            Expired
                                        </Badge>
                                    );
                                } else {
                                    // Active subscription
                                    return (
                                        <Badge className='bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'>
                                            Active
                                        </Badge>
                                    );
                                }
                            })()}
                        </div>

                        {currentSubscription.current_period_end && (
                            <p className='text-sm text-neutral-400 mb-4'>
                                {currentSubscription.cancel_at_period_end ? 'Ends on' : 'Renews on'}{' '}
                                {new Date(
                                    currentSubscription.current_period_end
                                ).toLocaleDateString()}
                            </p>
                        )}

                        {/* Scheduled Plan Change Banner */}
                        {currentSubscription.scheduled_plan_change &&
                            currentSubscription.scheduled_change_date && (
                                <div className='bg-blue-950/30 border border-blue-700/50 rounded-lg p-4 mb-4'>
                                    <div className='flex items-center space-x-3'>
                                        <div className='bg-blue-900/50 p-2 rounded-md'>
                                            <IconClock className='h-5 w-5 text-blue-400' />
                                        </div>
                                        <div className='flex-1'>
                                            <h4 className='font-medium text-blue-300'>
                                                Scheduled Plan Change
                                            </h4>
                                            <p className='text-sm text-blue-400/80'>
                                                Your plan will change to{' '}
                                                <span className='font-medium text-blue-300'>
                                                    {currentSubscription.scheduled_plan_change}
                                                </span>{' '}
                                                on{' '}
                                                <span className='font-medium text-blue-300'>
                                                    {new Date(
                                                        currentSubscription.scheduled_change_date
                                                    ).toLocaleDateString()}
                                                </span>
                                            </p>
                                            <p className='text-xs text-blue-400/60 mt-1'>
                                                You'll continue to have access to your current{' '}
                                                {currentSubscription.plan_name} plan until then.
                                            </p>
                                        </div>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            className='text-blue-400 border-blue-600 hover:bg-blue-950/50'
                                            onClick={async () => {
                                                try {
                                                    toast({
                                                        title: 'Cancelling scheduled change...',
                                                        description:
                                                            'Removing the scheduled plan change.',
                                                    });

                                                    // Call API to cancel the scheduled change
                                                    const response = await fetch(
                                                        '/api/stripe/cancel-scheduled-change',
                                                        {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                                accountId: account.id,
                                                                scheduleId:
                                                                    currentSubscription.stripe_schedule_id,
                                                            }),
                                                        }
                                                    );

                                                    const result = await response.json();

                                                    if (result.success) {
                                                        toast({
                                                            title: 'Scheduled change cancelled',
                                                            description:
                                                                'Your plan will remain as is. Refreshing...',
                                                        });
                                                        setTimeout(
                                                            () => window.location.reload(),
                                                            1500
                                                        );
                                                    } else {
                                                        toast({
                                                            variant: 'destructive',
                                                            title: 'Error',
                                                            description:
                                                                result.error ||
                                                                'Could not cancel scheduled change.',
                                                        });
                                                    }
                                                } catch (error) {
                                                    toast({
                                                        variant: 'destructive',
                                                        title: 'Error',
                                                        description:
                                                            'Could not cancel scheduled change.',
                                                    });
                                                }
                                            }}
                                        >
                                            Cancel Change
                                        </Button>
                                    </div>
                                </div>
                            )}

                        <div className='flex flex-wrap gap-2'>
                            {/* Only show Manage Billing button if user has a Stripe customer ID */}
                            {currentSubscription?.stripe_customer_id && (
                                <Button
                                    variant='outline'
                                    onClick={handleManageBilling}
                                    disabled={loading === 'portal'}
                                >
                                    {loading === 'portal' && (
                                        <IconLoader className='h-4 w-4 mr-2 animate-spin' />
                                    )}
                                    Manage Billing
                                </Button>
                            )}

                            {/* Manual sync button for troubleshooting */}
                            {/* <Button
                                variant='outline'
                                onClick={async () => {
                                    setLoading('sync');
                                    try {
                                        toast({
                                            title: 'Syncing subscription...',
                                            description:
                                                'Fetching latest subscription data from Stripe.',
                                        });

                                        const response = await fetch(
                                            '/api/stripe/sync-subscription-status',
                                            {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    accountId: account.id,
                                                }),
                                            }
                                        );

                                        const result = await response.json();

                                        if (result.success) {
                                            const planName =
                                                result.planName ||
                                                (result.status === 'free' ? 'Free' : 'Unknown');
                                            toast({
                                                title: 'Subscription synced!',
                                                description: `Updated to ${planName} plan. Refreshing page...`,
                                            });
                                            // Force a page refresh to show updated data
                                            setTimeout(() => {
                                                window.location.reload();
                                            }, 1500);
                                        } else {
                                            toast({
                                                variant: 'destructive',
                                                title: 'Sync failed',
                                                description:
                                                    result.error ||
                                                    'Could not sync subscription from Stripe.',
                                            });
                                        }
                                    } catch (error) {
                                        console.error('Sync error:', error);
                                        toast({
                                            variant: 'destructive',
                                            title: 'Sync error',
                                            description:
                                                error instanceof Error
                                                    ? error.message
                                                    : 'Could not connect to sync service.',
                                        });
                                    } finally {
                                        setLoading(null);
                                    }
                                }}
                                disabled={loading === 'sync'}
                                className='text-green-400 border-green-600 hover:bg-green-950/30'
                                title='Force sync subscription from Stripe'
                            >
                                {loading === 'sync' && (
                                    <IconLoader className='h-4 w-4 mr-2 animate-spin' />
                                )}
                                <RefreshCw className='h-4 w-4 mr-2' />
                                Force Sync
                            </Button>

                            <Button
                                variant='outline'
                                onClick={handleSyncBillingInfo}
                                disabled={loading === 'billing-sync'}
                                className='text-blue-400 border-blue-600 hover:bg-blue-950/30'
                                title='Sync company information to Stripe for invoices'
                            >
                                {loading === 'billing-sync' && (
                                    <IconLoader className='h-4 w-4 mr-2 animate-spin' />
                                )}
                                <IconCreditCard className='h-4 w-4 mr-2' />
                                Sync Billing Info
                            </Button> */}

                            {(() => {
                                // Don't show cancel subscription button for Free plan
                                if (currentSubscription.plan_name === 'Free') {
                                    return null;
                                }

                                const now = new Date();
                                const endDate = new Date(currentSubscription.current_period_end);
                                const isStillActive = endDate > now;
                                const isCancelledAtPeriodEnd =
                                    currentSubscription.cancel_at_period_end;

                                if (isCancelledAtPeriodEnd && isStillActive) {
                                    // Show reactivate button for cancelled subscriptions that are still active
                                    return (
                                        <Button
                                            variant='outline'
                                            className='border-emerald-700 text-emerald-400 hover:bg-emerald-950/30'
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(
                                                        '/api/stripe/reactivate-subscription',
                                                        {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({
                                                                subscriptionId:
                                                                    currentSubscription.stripe_subscription_id,
                                                                accountId: account.id,
                                                            }),
                                                        }
                                                    );

                                                    const result = await response.json();

                                                    if (result.success) {
                                                        toast({
                                                            title: 'Subscription reactivated!',
                                                            description:
                                                                'Your subscription will now continue past the end date. Refreshing page...',
                                                            duration: 2000,
                                                        });

                                                        // Add a small delay to show the success message
                                                        setTimeout(() => {
                                                            console.log(
                                                                '🔄 Reactivation success - refreshing page'
                                                            );
                                                            window.location.reload();
                                                        }, 1500);
                                                    } else {
                                                        throw new Error(result.error);
                                                    }
                                                } catch (error) {
                                                    toast({
                                                        title: 'Reactivation failed',
                                                        description:
                                                            'Could not reactivate subscription. Please try again.',
                                                        variant: 'destructive',
                                                    });
                                                }
                                            }}
                                        >
                                            Reactivate Subscription
                                        </Button>
                                    );
                                } else if (isCancelledAtPeriodEnd && !isStillActive) {
                                    // Subscription has expired - show choose new plan button
                                    return (
                                        <Button
                                            variant='outline'
                                            className='border-blue-700 text-blue-400 hover:bg-blue-950/30'
                                            onClick={() => {
                                                const plansSection =
                                                    document.getElementById('available-plans');
                                                if (plansSection) {
                                                    plansSection.scrollIntoView({
                                                        behavior: 'smooth',
                                                    });
                                                }
                                                toast({
                                                    title: 'Choose a new plan',
                                                    description:
                                                        'Select from the available plans below to resubscribe.',
                                                });
                                            }}
                                        >
                                            Choose New Plan
                                        </Button>
                                    );
                                } else {
                                    // Active subscription - show cancel button
                                    return (
                                        <SubscriptionCancelModal
                                            currentPlan={currentSubscription.plan_name}
                                            currentSeats={currentSubscription.seats || 1}
                                            currentPrice={currentSubscription.total_price || 0}
                                            accountId={account.id}
                                            subscriptionId={
                                                currentSubscription.stripe_subscription_id
                                            }
                                            periodEnd={currentSubscription.current_period_end}
                                            onCancelComplete={() => window.location.reload()}
                                        />
                                    );
                                }
                            })()}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Plans */}
            <div className='mt-12'>
                <div className='text-center mb-8'>
                    <h2 className='text-3xl font-bold text-white mb-4'>Choose Your Plan</h2>
                    <p className='text-zinc-400 text-lg max-w-2xl mx-auto'>
                        Select the plan that best fits your needs. Upgrade or downgrade at any time.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6' id='available-plans'>
                    {products.map((product: Plan) => {
                        console.log(`Processing product: ${product.name}`, product.prices);

                        const price = product.prices.find(
                            (p) => p.interval === (billingCycle === 'yearly' ? 'year' : 'month')
                        );

                        console.log(
                            `Found price for ${product.name}:`,
                            price,
                            'for billing cycle:',
                            billingCycle
                        );

                        if (!price) {
                            console.log(
                                `No price found for ${product.name} with interval ${billingCycle === 'yearly' ? 'year' : 'month'}`
                            );
                            return null;
                        }

                        const isCurrentPlan = currentSubscription?.plan_name === product.name;
                        const features =
                            product.metadata.features?.split(',') ||
                            getDefaultFeatures(product.name);
                        const isPopular = product.name.toLowerCase() === 'pro';

                        return (
                            <div
                                key={product.id}
                                className={`relative border rounded-lg p-6 ${
                                    isCurrentPlan
                                        ? 'border-amber-500 bg-amber-500/5'
                                        : isPopular
                                          ? 'border-blue-500 bg-blue-500/5'
                                          : 'border-neutral-800 bg-neutral-900/50'
                                }`}
                            >
                                {isPopular && !isCurrentPlan && (
                                    <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                                        <Badge className='bg-blue-500 text-white'>
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}

                                <div className='flex items-center justify-between mb-2'>
                                    <div className='flex items-center space-x-2'>
                                        {getPlanIcon(product.name)}
                                        <h3 className='font-semibold text-lg'>{product.name}</h3>
                                    </div>
                                    {isCurrentPlan && (
                                        <Badge className='bg-amber-500/20 text-amber-400'>
                                            Current
                                        </Badge>
                                    )}
                                </div>
                                <p className='text-neutral-400 text-sm mb-4'>
                                    {product.description}
                                </p>

                                <div className='mb-6'>
                                    <span className='text-3xl font-bold'>
                                        {formatPrice(price.amount, price.currency)}
                                    </span>
                                    <span className='text-neutral-400 ml-1'>
                                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                                    </span>
                                    {billingCycle === 'yearly' && price.amount > 0 && (
                                        <div className='text-xs text-emerald-400 mt-1'>
                                            Save 20% with annual billing
                                        </div>
                                    )}
                                </div>

                                {/* Plan Features */}
                                <ul className='space-y-2 mb-6'>
                                    {features.map((feature: string, index: number) => (
                                        <li key={index} className='flex items-start'>
                                            <IconCheck className='h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5' />
                                            <span className='text-sm'>{feature.trim()}</span>
                                        </li>
                                    ))}
                                </ul>

                                {isCurrentPlan ? (
                                    <Button className='w-full' variant='outline' disabled>
                                        Current Plan
                                    </Button>
                                ) : (
                                    <SubscriptionUpgradeModal
                                        currentPlan={currentSubscription?.plan_name || 'Free'}
                                        currentSeats={currentSubscription?.seats || 1}
                                        targetPlan={product.name}
                                        targetSeats={getSeatsFromPlan(product.name)}
                                        targetPriceId={price.id}
                                        accountId={account.id}
                                        currentPeriodEnd={
                                            currentSubscription?.current_period_end ||
                                            new Date(
                                                Date.now() + 30 * 24 * 60 * 60 * 1000
                                            ).toISOString()
                                        }
                                        onUpgradeComplete={() => window.location.reload()}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Debug section - only show in development or when explicitly needed */}
            {process.env.NODE_ENV === 'development' && (shouldAutoSync || hasAutoSynced) && (
                <Card className='border-purple-500/50 bg-purple-950/20'>
                    <CardHeader>
                        <CardTitle className='text-purple-400 text-sm'>
                            Auto-Sync Debug (Dev Only)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2 text-xs'>
                            <div>
                                <strong>Should Auto-Sync:</strong> {shouldAutoSync ? 'Yes' : 'No'}
                            </div>
                            <div>
                                <strong>Has Auto-Synced:</strong> {hasAutoSynced ? 'Yes' : 'No'}
                            </div>
                            <div>
                                <strong>Auto-Sync Reason:</strong> {autoSyncReason || 'None'}
                            </div>
                            <div>
                                <strong>Loading State:</strong> {loading || 'None'}
                            </div>
                            <div>
                                <strong>Last Auto-Sync:</strong> {lastAutoSyncTime}
                            </div>
                        </div>

                        {shouldAutoSync && !hasAutoSynced && (
                            <div className='mt-3 p-2 bg-blue-900/30 rounded border border-blue-700'>
                                <p className='text-blue-300 text-xs'>
                                    🎯 Server recommended auto-sync: {autoSyncReason}
                                </p>
                            </div>
                        )}

                        {hasAutoSynced && (
                            <div className='mt-3 p-2 bg-green-900/30 rounded border border-green-700'>
                                <p className='text-green-300 text-xs'>
                                    ✅ Auto-sync triggered. Page will refresh when complete.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
