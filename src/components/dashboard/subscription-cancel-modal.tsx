'use client';
import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
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
    IconAlertTriangle,
    IconX,
    IconArrowDown,
    IconCreditCard,
    IconMessageCircle,
} from '@tabler/icons-react';

type SubscriptionCancelProps = {
    currentPlan: string;
    currentSeats: number;
    currentPrice: number;
    accountId: string;
    subscriptionId: string;
    periodEnd: string;
    onCancelComplete?: () => void;
};

const cancellationReasons = [
    { id: 'too-expensive', label: 'Too expensive', icon: '💰' },
    { id: 'not-using', label: 'Not using it enough', icon: '📉' },
    { id: 'missing-features', label: 'Missing features I need', icon: '🔧' },
    { id: 'switching-competitor', label: 'Switching to a competitor', icon: '🔄' },
    { id: 'technical-issues', label: 'Technical issues', icon: '🐛' },
    { id: 'other', label: 'Other reason', icon: '💭' },
];

export function SubscriptionCancelModal({
    currentPlan,
    currentSeats,
    currentPrice,
    accountId,
    subscriptionId,
    periodEnd,
    onCancelComplete,
}: SubscriptionCancelProps) {
    // Debug props being passed to modal
    console.log('🔍 SubscriptionCancelModal props:', {
        currentPlan,
        currentSeats,
        currentPrice,
        accountId,
        subscriptionId,
        periodEnd,
    });
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [step, setStep] = useState<'reason' | 'options' | 'confirm'>('reason');
    const [selectedReason, setSelectedReason] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Debug logging
    React.useEffect(() => {
        console.log('🔍 Cancel Modal Debug:', {
            showCancelDialog,
            step,
            selectedReason,
            isPending,
        });
    }, [showCancelDialog, step, selectedReason, isPending]);

    const periodEndDate = new Date(periodEnd);
    const daysUntilEnd = Math.ceil((periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const handleCancel = async () => {
        console.log('🔴 handleCancel called - Starting cancellation process');
        startTransition(async () => {
            try {
                console.log('🔴 Showing processing toast');
                toast({
                    title: 'Processing cancellation...',
                    description: 'Updating your subscription status.',
                });

                console.log('🔴 Making API call to cancel subscription');
                const requestData = {
                    subscriptionId,
                    accountId,
                    cancelAtPeriodEnd: true, // Always cancel at period end
                    reason: selectedReason,
                    feedback,
                };
                console.log('🔴 Request data:', requestData);

                const response = await fetch('/api/stripe/cancel-subscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                const result = await response.json();
                console.log('🔴 API Response:', {
                    status: response.status,
                    result,
                    success: result.success,
                    error: result.error,
                });

                if (result.success) {
                    toast({
                        title: '✅ Subscription cancelled successfully',
                        description: `Your ${currentPlan} plan will remain active until ${periodEndDate.toLocaleDateString()}. Page will refresh to show changes.`,
                        duration: 3000, // Show for 3 seconds
                    });
                    setShowCancelDialog(false);
                    // Reset form state
                    setStep('reason');
                    setSelectedReason('');
                    setFeedback('');

                    // Show refreshing toast and then refresh
                    setTimeout(() => {
                        toast({
                            title: 'Updating subscription status...',
                            description: 'Refreshing page to show cancellation changes.',
                            duration: 1000,
                        });

                        // Force page refresh after a short delay
                        setTimeout(() => {
                            console.log('🔄 Calling onCancelComplete to refresh page');
                            onCancelComplete?.();
                        }, 1000);
                    }, 2000); // Wait 2 seconds, then show refresh toast and refresh after 1 more second
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Cancellation failed',
                        description: result.error || 'Could not cancel subscription.',
                    });
                }
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Cancellation error',
                    description: error?.message || 'Could not process cancellation.',
                });
            }
        });
    };

    const renderStep = () => {
        switch (step) {
            case 'reason':
                return (
                    <div className='space-y-4'>
                        <div>
                            <h4 className='font-medium mb-3'>Why are you cancelling? (Optional)</h4>
                            <div className='space-y-2'>
                                {cancellationReasons.map((reason) => (
                                    <Button
                                        key={reason.id}
                                        variant={
                                            selectedReason === reason.id ? 'default' : 'outline'
                                        }
                                        className={`w-full justify-start text-left h-auto p-3 ${
                                            selectedReason === reason.id
                                                ? 'bg-blue-600 hover:bg-blue-700 border-blue-500'
                                                : 'hover:bg-neutral-800/50'
                                        }`}
                                        onClick={() => setSelectedReason(reason.id)}
                                    >
                                        <span className='mr-2'>{reason.icon}</span>
                                        <span>{reason.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {(selectedReason === 'other' || selectedReason === 'missing-features') && (
                            <div>
                                <Label htmlFor='feedback'>Tell us more (Optional)</Label>
                                <Textarea
                                    id='feedback'
                                    placeholder='Your feedback helps us improve...'
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className='mt-1'
                                />
                            </div>
                        )}
                    </div>
                );

            case 'options':
                return (
                    <div className='space-y-4'>
                        <h4 className='font-medium'>Before you go, consider these options:</h4>

                        {/* Downgrade Option */}
                        <Card className='border-blue-700 bg-blue-950/20'>
                            <CardContent className='p-4'>
                                <div className='flex items-start space-x-3'>
                                    <IconArrowDown className='h-5 w-5 text-blue-400 mt-0.5' />
                                    <div className='flex-1'>
                                        <h5 className='font-medium text-blue-300'>
                                            Downgrade Instead
                                        </h5>
                                        <p className='text-sm text-blue-400/80 mt-1'>
                                            Switch to a lower plan and keep your account active
                                        </p>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            className='mt-2 border-blue-600 text-blue-400 hover:bg-blue-950/30'
                                            onClick={() => {
                                                setShowCancelDialog(false);
                                                // Could trigger downgrade modal here
                                                toast({
                                                    title: 'Downgrade option',
                                                    description:
                                                        'Visit the subscription page to downgrade your plan.',
                                                });
                                            }}
                                        >
                                            View Downgrade Options
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Continue with Cancellation */}
                        <div className='border-t border-neutral-700 pt-4'>
                            <h5 className='font-medium mb-2'>Cancellation Details</h5>
                            <div className='space-y-2'>
                                <Card className='border-green-700 bg-green-950/20'>
                                    <CardContent className='p-3'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex-1'>
                                                <div className='flex items-center space-x-2'>
                                                    <div className='font-medium'>
                                                        Cancel at period end
                                                    </div>
                                                    <Badge className='bg-green-900/30 text-green-400'>
                                                        Recommended
                                                    </Badge>
                                                </div>
                                                <div className='text-sm text-neutral-400 mt-1'>
                                                    Keep access until{' '}
                                                    {periodEndDate.toLocaleDateString()} (
                                                    {daysUntilEnd} days)
                                                </div>
                                                <div className='text-xs text-green-400 mt-1'>
                                                    ✓ You can reactivate anytime before then
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                );

            case 'confirm':
                return (
                    <div className='space-y-4'>
                        <div className='flex items-start space-x-3 p-4 bg-red-950/20 border border-red-900/50 rounded-md'>
                            <IconAlertTriangle className='w-5 h-5 text-red-400 mt-0.5 flex-shrink-0' />
                            <div>
                                <h5 className='font-medium text-red-300'>Confirm Cancellation</h5>
                                <p className='text-sm text-red-400/80 mt-1'>
                                    Your ${currentPlan} plan will be cancelled but remain active
                                    until ${periodEndDate.toLocaleDateString()}. You can reactivate
                                    anytime before then.
                                </p>
                            </div>
                        </div>

                        <div className='bg-neutral-800/50 p-4 rounded-md'>
                            <h6 className='font-medium mb-2'>What you'll lose:</h6>
                            <ul className='text-sm text-neutral-400 space-y-1'>
                                <li>• Access to {currentSeats} team member seats</li>
                                <li>• Advanced email analysis features</li>
                                <li>• Priority support</li>
                                <li>• Custom security rules</li>
                                <li>• API access</li>
                            </ul>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Button
                variant='outline'
                className='border-red-700 text-red-400 hover:bg-red-950/30'
                onClick={() => {
                    console.log('🔵 Opening cancel modal');
                    setShowCancelDialog(true);
                }}
            >
                <IconX className='h-4 w-4 mr-2' />
                Cancel Subscription
            </Button>

            <AlertDialog
                open={showCancelDialog}
                onOpenChange={(open) => {
                    console.log('🔵 Modal open change:', open);
                    if (!open) {
                        // Reset state when closing
                        setStep('reason');
                        setSelectedReason('');
                        setFeedback('');
                    }
                    setShowCancelDialog(open);
                }}
            >
                <AlertDialogContent className='max-w-2xl'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center space-x-2'>
                            {step === 'confirm' ? (
                                <IconAlertTriangle className='h-5 w-5 text-red-400' />
                            ) : (
                                <IconMessageCircle className='h-5 w-5' />
                            )}
                            <span>
                                {step === 'reason' && 'Cancel Subscription'}
                                {step === 'options' && 'Wait! We have options'}
                                {step === 'confirm' && 'Confirm Cancellation'}
                            </span>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {step === 'reason' &&
                                "We're sorry to see you go. Help us understand why."}
                            {step === 'options' &&
                                'Before cancelling, consider these alternatives that might work better for you.'}
                            {step === 'confirm' &&
                                'This action cannot be undone. Please review the details below.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className='py-4'>{renderStep()}</div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setShowCancelDialog(false);
                                setStep('reason');
                                setSelectedReason('');
                                setFeedback('');
                            }}
                        >
                            Keep Subscription
                        </AlertDialogCancel>

                        {step === 'reason' && (
                            <Button
                                onClick={() => {
                                    console.log('🔵 Continue clicked - going to options step');
                                    setStep('options');
                                }}
                            >
                                Continue
                            </Button>
                        )}

                        {step === 'options' && (
                            <Button
                                onClick={() => {
                                    console.log('🔵 Proceed clicked - going to confirm step');
                                    setStep('confirm');
                                }}
                                className='bg-red-600 hover:bg-red-700 text-white'
                            >
                                Proceed with Cancellation
                            </Button>
                        )}

                        {step === 'confirm' && (
                            <AlertDialogAction
                                onClick={handleCancel}
                                disabled={isPending}
                                className='bg-red-600 hover:bg-red-700'
                            >
                                {isPending ? 'Cancelling...' : 'Yes, Cancel Subscription'}
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
