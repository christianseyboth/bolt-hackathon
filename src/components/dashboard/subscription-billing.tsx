'use client';

import React, { useState } from 'react';
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
    IconUsers
} from '@tabler/icons-react';
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
}

export function SubscriptionBilling({ products, currentSubscription, account }: SubscriptionBillingProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const { toast } = useToast();

    // Debug logging
    console.log('SubscriptionBilling received products:', products?.length || 0);
    console.log('Products data:', products);
    console.log('🔍 FULL Current subscription object:', JSON.stringify(currentSubscription, null, 2));
    console.log('🔍 Subscription status:', currentSubscription?.status);
    console.log('🔍 Subscription cancel_at_period_end:', currentSubscription?.cancel_at_period_end);
    console.log('🔍 Should show "Ends on"?', currentSubscription?.status === 'cancelled' || currentSubscription?.cancel_at_period_end);
    console.log('🔍 All subscription keys:', currentSubscription ? Object.keys(currentSubscription) : 'No subscription');
    console.log('🔍 Account stripe_subscription_id:', account?.stripe_subscription_id);

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
                description: error instanceof Error ? error.message : 'Failed to start checkout process',
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
                    accountId: account.id
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
                description: error instanceof Error ? error.message : 'Failed to open billing portal',
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
            'Solo': [
                'Up to 1,000 email analyses per month',
                'Real-time threat detection',
                'Basic AI analysis',
                'Email support',
                'Standard security rules',
                'Basic API access'
            ],
            'Entrepreneur': [
                'Up to 5,000 email analyses per month',
                'Real-time threat detection',
                'Advanced AI analysis',
                'Priority email support',
                'Custom rules & policies',
                'Full API access',
                'Advanced reporting',
                'Team collaboration'
            ],
            'Team': [
                'Up to 20,000 email analyses per month',
                'Real-time threat detection',
                'Advanced AI analysis',
                'Priority 24/7 support',
                'Custom rules & policies',
                'Full API access',
                'HIPAA compliance',
                'Dedicated account manager',
                'Custom integrations',
                'Multi-team management'
            ]
        };
        return defaultFeatures[planName] || [];
    };

    const getPlanIcon = (planName: string) => {
        switch (planName.toLowerCase()) {
            case 'solo':
                return <IconBolt className="h-5 w-5 text-blue-400" />;
            case 'entrepreneur':
                return <IconStar className="h-5 w-5 text-purple-400" />;
            case 'team':
                return <IconUsers className="h-5 w-5 text-emerald-400" />;
            default:
                return <IconUsers className="h-5 w-5 text-neutral-400" />;
        }
    };

    const getSeatsFromPlan = (planName: string): number => {
        const planSeats: Record<string, number> = {
            'Free': 1,
            'Solo': 1,
            'Entrepreneur': 5,
            'Team': 20,
        };

        return planSeats[planName] || 1;
    };

    return (
        <div className="space-y-6">
            {/* Current Subscription Card */}
            {currentSubscription && (
                <Card className="border-neutral-800 bg-neutral-900">
                    <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-amber-500 to-amber-300 rounded-full p-1.5">
                                <IconCrown className="h-4 w-4 text-black" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Current Plan</CardTitle>
                                <CardDescription>{currentSubscription.plan_name} Subscription</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                {getPlanIcon(currentSubscription.plan_name)}
                                <div>
                                    <h3 className="font-medium text-lg">{currentSubscription.plan_name}</h3>
                                    <p className="text-sm text-neutral-400">
                                        ${currentSubscription.total_price}/month
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                                {currentSubscription.status}
                            </Badge>
                        </div>

                        {currentSubscription.current_period_end && (
                            <p className="text-sm text-neutral-400 mb-4">
                                {currentSubscription.status === 'cancelled' || currentSubscription.cancel_at_period_end
                                    ? 'Ends on'
                                    : 'Renews on'
                                } {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                onClick={handleManageBilling}
                                disabled={loading === 'portal'}
                            >
                                {loading === 'portal' && <IconLoader className="h-4 w-4 mr-2 animate-spin" />}
                                <IconCreditCard className="h-4 w-4 mr-2" />
                                Manage Billing
                            </Button>

                            {/* Only show cancel button if subscription is not already cancelled */}
                            {!(currentSubscription.status === 'cancelled' || currentSubscription.cancel_at_period_end) ? (
                                <SubscriptionCancelModal
                                    currentPlan={currentSubscription.plan_name}
                                    currentSeats={currentSubscription.seats || 1}
                                    currentPrice={currentSubscription.total_price || 0}
                                    accountId={account.id}
                                    subscriptionId={account.stripe_subscription_id}
                                    periodEnd={currentSubscription.current_period_end}
                                    onCancelComplete={() => window.location.reload()}
                                />
                            ) : (
                                <Badge className="bg-amber-900/30 text-amber-400 border border-amber-700 px-3 py-1">
                                    Subscription Cancelled
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Plans */}
            <Card className="border-neutral-800 bg-neutral-900">
                <CardHeader>
                    <CardTitle>Available Plans</CardTitle>
                    <CardDescription>Choose the plan that works best for your security needs</CardDescription>

                    {/* Billing Toggle */}
                    <div className="flex items-center space-x-2 mt-4">
                        <Button
                            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBillingCycle('monthly')}
                        >
                            Monthly
                        </Button>
                        <Button
                            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setBillingCycle('yearly')}
                        >
                            Yearly
                        </Button>
                        {billingCycle === 'yearly' && (
                            <Badge variant="secondary" className="ml-2">
                                <IconStar className="h-3 w-3 mr-1" />
                                Save 20%
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Debug info */}
                        {(!products || products.length === 0) && (
                            <div className="col-span-full text-center py-8 text-neutral-400">
                                <p>No products available. Check console for debug info.</p>
                                <p className="text-xs mt-2">Products array: {products ? `${products.length} items` : 'null/undefined'}</p>
                            </div>
                        )}

                        {products && products.map((product) => {
                            console.log(`Processing product: ${product.name}`, product.prices);

                            const price = product.prices.find(p =>
                                p.interval === (billingCycle === 'yearly' ? 'year' : 'month')
                            );

                            console.log(`Found price for ${product.name}:`, price, 'for billing cycle:', billingCycle);

                            if (!price) {
                                console.log(`No price found for ${product.name} with interval ${billingCycle === 'yearly' ? 'year' : 'month'}`);
                                return null;
                            }

                            const isCurrentPlan = currentSubscription?.plan_name === product.name;
                            const features = product.metadata.features?.split(',') || getDefaultFeatures(product.name);
                            const isPopular = product.name.toLowerCase() === 'pro';

                            return (
                                <div
                                    key={product.id}
                                    className={`relative border rounded-lg p-6 ${isCurrentPlan
                                            ? 'border-amber-500 bg-amber-500/5'
                                            : isPopular
                                                ? 'border-blue-500 bg-blue-500/5'
                                                : 'border-neutral-800 bg-neutral-900/50'
                                        }`}
                                >
                                    {isPopular && !isCurrentPlan && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <Badge className="bg-blue-500 text-white">
                                                Most Popular
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            {getPlanIcon(product.name)}
                                            <h3 className="font-semibold text-lg">{product.name}</h3>
                                        </div>
                                        {isCurrentPlan && (
                                            <Badge className="bg-amber-500/20 text-amber-400">
                                                Current
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-neutral-400 text-sm mb-4">{product.description}</p>

                                    <div className="mb-6">
                                        <span className="text-3xl font-bold">
                                            {formatPrice(price.amount, price.currency)}
                                        </span>
                                        <span className="text-neutral-400 ml-1">
                                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                                        </span>
                                        {billingCycle === 'yearly' && price.amount > 0 && (
                                            <div className="text-xs text-emerald-400 mt-1">
                                                Save 20% with annual billing
                                            </div>
                                        )}
                                    </div>

                                    {/* Plan Features */}
                                    <ul className="space-y-2 mb-6">
                                        {features.map((feature: string, index: number) => (
                                            <li key={index} className="flex items-start">
                                                <IconCheck className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature.trim()}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {isCurrentPlan ? (
                                        <Button className="w-full" variant="outline" disabled>
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
                                            currentPeriodEnd={currentSubscription?.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}
                                            onUpgradeComplete={() => window.location.reload()}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
