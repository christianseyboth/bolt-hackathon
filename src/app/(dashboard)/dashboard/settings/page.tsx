import React from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SubscriptionSettings } from '@/components/dashboard/subscription-settings';
import { DeleteAccountSection } from '@/components/dashboard/delete-account-section';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { log } from 'console';

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }
    let { data: account_data, error: subscription_error } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    let { data: subscription_plans, error: subscription_plans_error } = await supabase
        .from('subscription_plans')
        .select('*');

    let { data: current_subscription, error: current_subscription_error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('account_id', account_data.id)
        .single();

    return (
        <>
            <DashboardHeader
                heading='Settings'
                subheading='Manage your account settings and preferences'
            />
            <div className='mt-8 space-y-6'>
                <SubscriptionSettings
                    subscriptionPlans={subscription_plans}
                    currentSubscription={current_subscription}
                />
                <DeleteAccountSection />
            </div>
        </>
    );
}
