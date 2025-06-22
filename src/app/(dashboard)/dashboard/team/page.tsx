import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TeamManagement } from '@/components/dashboard/TeamManagement';
import { SubscriptionStatusBanner } from '@/components/dashboard/SubscriptionStatusBanner';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { enforceSubscriptionLimits } from './actions';
import { getCurrentActiveSubscription } from '@/lib/subscription-utils';

export default async function TeamPage() {
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

    let { data: subscription_plans, error: subscription_plans_error } = await supabase
        .from('subscription_plans')
        .select('*');

    // Get the most current active subscription (handles multiple subscriptions correctly)
    const { subscription: current_subscription, error: current_subscription_error } =
        await getCurrentActiveSubscription(account_data.id);

    if (current_subscription_error || !current_subscription) {
        console.error('No active subscription found:', current_subscription_error);
        redirect('/dashboard/subscription');
    }

    // Automatically enforce subscription limits when page loads
    try {
        await enforceSubscriptionLimits(current_subscription.id);
    } catch (error) {
        console.error('Error enforcing subscription limits:', error);
    }

    const { data: members } = await supabase
        .from('authorized_addresses')
        .select('id, email, label, created_at, status')
        .eq('subscription_id', current_subscription.id)
        .order('created_at', { ascending: true });

    return (
        <>
            <DashboardHeader
                heading='Team Management'
                subheading='Manage who can send emails for analysis'
            />

            {/* Subscription Status Banner - Shows pending upgrades and renewal info */}
            <div className='mt-8'>
                <SubscriptionStatusBanner
                    currentPlan={current_subscription.plan_name || 'Free'}
                    currentSeats={current_subscription.seats}
                    periodEnd={current_subscription.current_period_end}
                    accountId={account_data.id}
                />
            </div>

            <div className='mt-6'>
                <TeamManagement
                    initialMembers={members || []}
                    maxTeamMembers={current_subscription.seats}
                    account={account_data}
                    subscription={current_subscription}
                />
            </div>
        </>
    );
}
