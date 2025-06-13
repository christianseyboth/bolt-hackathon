import React from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getAllSubscriptions, getCurrentActiveSubscription } from '@/lib/subscription-utils';
import { SubscriptionDebugClient } from '@/components/dashboard/subscription-debug-client';

export default async function SubscriptionDebugPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }

    let { data: account_data, error: account_error } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    if (account_error || !account_data) {
        redirect('/login');
    }

    // Get all subscriptions for debugging
    const { subscriptions, activeSubscriptions, inactiveSubscriptions, error: allSubsError } =
        await getAllSubscriptions(account_data.id);

    // Get current active subscription
    const { subscription: currentSubscription, error: currentSubError, totalActiveSubscriptions } =
        await getCurrentActiveSubscription(account_data.id);

    return (
        <>
            <DashboardHeader
                heading='Subscription Debug'
                subheading='Debug information for subscription issues'
            />

            <div className='mt-8'>
                <SubscriptionDebugClient
                    initialSubscriptions={subscriptions}
                    initialCurrentSubscription={currentSubscription}
                    activeSubscriptions={activeSubscriptions}
                    inactiveSubscriptions={inactiveSubscriptions}
                    account={account_data}
                />
            </div>
        </>
    );
}
