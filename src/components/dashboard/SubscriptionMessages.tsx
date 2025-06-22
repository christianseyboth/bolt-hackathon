'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../ui/use-toast';

export function SubscriptionMessages() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');

        if (success === 'true') {
            toast({
                title: 'Subscription Successful!',
                description: 'Welcome to your new plan! Your subscription is now active.',
                variant: 'default',
                duration: 5000,
            });

            // Clean up URL parameters
            const url = new URL(window.location.href);
            url.searchParams.delete('success');
            router.replace(url.pathname, { scroll: false });
        }

        if (canceled === 'true') {
            toast({
                title: 'Subscription Canceled',
                description: 'Your subscription process was canceled. You can try again anytime.',
                variant: 'destructive',
                duration: 5000,
            });

            // Clean up URL parameters
            const url = new URL(window.location.href);
            url.searchParams.delete('canceled');
            router.replace(url.pathname, { scroll: false });
        }
    }, [searchParams, toast, router]);

    return null; // This component doesn't render anything visible
}
