'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../ui/use-toast';
import { Badge } from '../ui/Badge';
import { IconCreditCard, IconCrown, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { SubscriptionCancelModal } from './SubscriptionCancelModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { cn } from '@/lib/utils';

interface PlanFeature {
    name: string;
    basic: boolean;
    pro: boolean;
    enterprise: boolean;
}

const planFeatures: PlanFeature[] = [
    { name: 'Email Analysis', basic: true, pro: true, enterprise: true },
    { name: 'Threat Detection', basic: true, pro: true, enterprise: true },
    { name: 'Real-time Scanning', basic: false, pro: true, enterprise: true },
    { name: 'Team Members', basic: false, pro: true, enterprise: true },
    { name: 'Advanced AI Analysis', basic: false, pro: true, enterprise: true },
    { name: 'Custom Rules & Policies', basic: false, pro: false, enterprise: true },
    { name: 'API Access', basic: false, pro: false, enterprise: true },
    { name: '24/7 Priority Support', basic: false, pro: false, enterprise: true },
    { name: 'HIPAA Compliance', basic: false, pro: false, enterprise: true },
];

export function SubscriptionSettings({
    subscriptionPlans,
    currentSubscription,
    account,
}: {
    subscriptionPlans: any;
    currentSubscription: any;
    account: any;
}) {
    const { toast } = useToast();
    const [currentPlan, setCurrentPlan] = useState(currentSubscription.plan_name);
    const [billingCycle, setBillingCycle] = useState('monthly');

    const date = new Date(currentSubscription.current_period_end);

    const handleSubscriptionChange = (planId: string) => {
        if (planId === currentPlan) {
            return;
        }

        toast({
            title: 'Subscription update',
            description: `Your subscription will be changed to ${
                planId.charAt(0).toUpperCase() + planId.slice(1)
            }`,
        });

        // Mock update to see UI changes
        setCurrentPlan(planId);
    };

    const toggleBillingCycle = () => {
        setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
        toast({
            title: 'Billing cycle changed',
            description: `Your billing cycle has been updated to ${
                billingCycle === 'monthly' ? 'yearly' : 'monthly'
            }.`,
        });
    };

    return (
        <>
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader className='pb-3'>
                    <div className='flex items-center space-x-2'>
                        <div className='bg-neutral-800 p-2 rounded-md'>
                            <IconCreditCard className='h-5 w-5 text-cyan-500' />
                        </div>
                        <div>
                            <CardTitle className='text-lg'>Subscription</CardTitle>
                            <CardDescription>Manage your subscription and billing</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='space-y-6'>
                        {/* Current Plan */}
                        <div className='p-4 border border-neutral-800 rounded-lg bg-neutral-900/50'>
                            <div className='flex items-center justify-between mb-4'>
                                <div className='flex items-center space-x-3'>
                                    <div className='bg-gradient-to-r from-amber-500 to-amber-300 rounded-full p-1.5'>
                                        <IconCrown className='h-4 w-4 text-black' />
                                    </div>
                                    <div>
                                        <h3 className='font-medium text-lg'>
                                            {currentSubscription.plan_name}
                                        </h3>
                                        <p className='text-sm text-neutral-400'>
                                            ${currentSubscription.total_price}/month
                                        </p>
                                    </div>
                                </div>
                                <Badge className='bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'>
                                    Current Plan
                                </Badge>
                            </div>

                            <div className='flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0'>
                                <p className='text-sm text-neutral-400'>
                                    Your plan{' '}
                                    {currentSubscription.status === 'cancelled' ||
                                    currentSubscription.cancel_at_period_end
                                        ? 'ends on'
                                        : 'renews on'}{' '}
                                    <span className='text-neutral-200'>
                                        {date.toLocaleDateString()}
                                    </span>
                                </p>
                                <div className='flex space-x-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={toggleBillingCycle}
                                    >
                                        Switch to{' '}
                                        {billingCycle === 'monthly' ? 'Yearly' : 'Monthly'} Billing
                                    </Button>
                                    <SubscriptionCancelModal
                                        currentPlan={currentSubscription.plan_name}
                                        currentSeats={currentSubscription.seats || 1}
                                        currentPrice={currentSubscription.total_price || 0}
                                        accountId={account.id}
                                        subscriptionId={currentSubscription.stripe_subscription_id}
                                        periodEnd={currentSubscription.current_period_end}
                                        onCancelComplete={() => window.location.reload()}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Billing information */}
                        <div>
                            <h3 className='font-medium mb-3'>Billing Information</h3>
                            <div className='bg-neutral-800/30 p-4 rounded-lg'>
                                <div className='flex justify-between mb-2'>
                                    <span className='text-sm text-neutral-400'>Payment Method</span>
                                    <span className='text-sm'>Visa ending in 4242</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-sm text-neutral-400'>Billing Email</span>
                                    <span className='text-sm'>billing@yourcompany.com</span>
                                </div>
                            </div>
                            <div className='mt-4 flex justify-end'>
                                <Button variant='outline' size='sm'>
                                    Update Payment Method
                                </Button>
                            </div>
                        </div>

                        {/* Billing history */}
                        <div>
                            <h3 className='font-medium mb-3'>Recent Invoices</h3>
                            <div className='overflow-auto'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className='text-right'>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>INV-001</TableCell>
                                            <TableCell>$29.00</TableCell>
                                            <TableCell>May 15, 2024</TableCell>
                                            <TableCell className='text-right'>
                                                <Badge className='bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50'>
                                                    Paid
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>INV-002</TableCell>
                                            <TableCell>$29.00</TableCell>
                                            <TableCell>April 15, 2024</TableCell>
                                            <TableCell className='text-right'>
                                                <Badge className='bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50'>
                                                    Paid
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>INV-003</TableCell>
                                            <TableCell>$29.00</TableCell>
                                            <TableCell>March 15, 2024</TableCell>
                                            <TableCell className='text-right'>
                                                <Badge className='bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50'>
                                                    Paid
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Plan comparison and upgrade options */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='text-lg'>Available Plans</CardTitle>
                    <CardDescription>
                        Compare plans and choose the one that&apos;s right for you
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                        {subscriptionPlans.map((plan: any) => (
                            <div
                                key={plan.id}
                                className={cn(
                                    'relative rounded-lg border p-6',
                                    plan.name === currentPlan
                                        ? 'border-amber-500/50 bg-amber-900/10'
                                        : 'border-neutral-800 bg-neutral-900/50',
                                    plan.popular && 'ring-2 ring-cyan-500/30'
                                )}
                            >
                                {plan.popular && (
                                    <Badge className='absolute -top-2 right-6 bg-cyan-500 hover:bg-cyan-600'>
                                        Popular
                                    </Badge>
                                )}

                                <h3 className='text-xl font-medium'>{plan.name}</h3>
                                <p className='text-sm text-neutral-400 mt-1'>{plan.description}</p>

                                <div className='mt-4 mb-6'>
                                    <span className='text-3xl font-bold'>
                                        $
                                        {billingCycle === 'monthly'
                                            ? plan.price_monthly
                                            : plan.price_yearly}
                                    </span>
                                    <span className='text-neutral-400 ml-1'>
                                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                                    </span>

                                    {billingCycle === 'yearly' && plan.price_monthly > 0 && (
                                        <div className='text-xs text-emerald-400 mt-1'>
                                            Save $
                                            {(plan.price_monthly * 12 - plan.price_yearly).toFixed(
                                                2
                                            )}{' '}
                                            with annual billing
                                        </div>
                                    )}
                                </div>

                                <ul className='space-y-2 mb-8'>
                                    {plan.features.map((feature: any, index: number) => (
                                        <li key={index} className='flex items-start'>
                                            <IconCheck className='h-5 w-5 text-emerald-400 mr-2 flex-shrink-0' />
                                            <span className='text-sm'>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className='mt-auto'>
                                    <Button
                                        variant={plan.isCurrent ? 'outline' : 'default'}
                                        className={cn(
                                            'w-full',
                                            plan.isCurrent && 'border-amber-500/30 text-amber-400'
                                        )}
                                        onClick={() => handleSubscriptionChange(plan.id)}
                                        disabled={plan.isCurrent}
                                    >
                                        {plan.isCurrent ? 'Current Plan' : 'Select Plan'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='bg-neutral-800/30 rounded-lg p-4 flex items-start space-x-3'>
                        <IconInfoCircle className='h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5' />
                        <div className='text-sm text-neutral-300'>
                            Need a custom plan for your organization? Contact our sales team at
                            <a
                                href='mailto:sales@secpilot.com'
                                className='text-cyan-400 hover:underline ml-1'
                            >
                                sales@secpilot.com
                            </a>
                        </div>
                    </div>

                    <div className='mt-8'>
                        <h3 className='font-medium mb-4'>Compare All Features</h3>
                        <div
                            className='overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#525252 #262626' }}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-[250px]'>Feature</TableHead>
                                        <TableHead>Basic</TableHead>
                                        <TableHead>Pro</TableHead>
                                        <TableHead>Enterprise</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {planFeatures.map((feature) => (
                                        <TableRow key={feature.name}>
                                            <TableCell className='font-medium'>
                                                {feature.name}
                                            </TableCell>
                                            <TableCell>
                                                {feature.basic ? (
                                                    <IconCheck className='h-4 w-4 text-emerald-400' />
                                                ) : (
                                                    <span className='text-neutral-600'>—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {feature.pro ? (
                                                    <IconCheck className='h-4 w-4 text-emerald-400' />
                                                ) : (
                                                    <span className='text-neutral-600'>—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {feature.enterprise ? (
                                                    <IconCheck className='h-4 w-4 text-emerald-400' />
                                                ) : (
                                                    <span className='text-neutral-600'>—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
