import React from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SubscriptionBilling } from '@/components/dashboard/subscription-billing';
import { InvoiceSection } from '@/components/dashboard/invoice-section';
import { getCurrentActiveSubscription } from '@/lib/subscription-utils';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }

    // Get account data
    let { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    // If no account exists, this means the handle_new_user trigger didn't run or failed
    // We should not create a duplicate account here, instead show an error
    if (accountError || !account) {
        console.error('❌ No account found for user:', user.id, 'Error:', accountError);
        console.error(
            '❌ This suggests the handle_new_user trigger failed or user was created outside the normal flow'
        );

        // For debugging, let's check if there are any accounts for this user
        const { data: allAccounts, error: allAccountsError } = await supabase
            .from('accounts')
            .select('id, owner_id, billing_email, created_at')
            .eq('owner_id', user.id);

        // Try to find account by email as fallback
        const { data: accountByEmail, error: emailError } = await supabase
            .from('accounts')
            .select('*')
            .eq('billing_email', user.email)
            .single();

        if (accountByEmail && !emailError) {
            console.log('✅ Found account by email instead of owner_id:', accountByEmail.id);
            account = accountByEmail;
        } else {
            console.error('❌ No account found by email either. User needs account setup.');
            console.log('🔄 Redirecting to setup-account page...');
            redirect('/setup-account?error=no-account-found');
        }
    }

    // Get current subscription using single source of truth
    const {
        subscription: currentSubscription,
        error: subscriptionError,
        isActive,
        isExpired,
    } = await getCurrentActiveSubscription(account.id);

    // Log subscription status for debugging
    if (subscriptionError) {
        console.log('🔍 Subscription error:', subscriptionError);
    }

    // Auto-sync is no longer needed since we're using single source of truth
    // The subscriptions table IS the truth, not the accounts table
    let shouldAutoSync = false;
    let autoSyncReason = '';

    // Only auto-sync if we have Stripe integration issues (missing customer ID, etc.)
    if (
        currentSubscription &&
        currentSubscription.stripe_subscription_id &&
        !currentSubscription.stripe_customer_id
    ) {
        shouldAutoSync = true;
        autoSyncReason = 'Subscription missing Stripe customer ID';
    }

    // Products will be fetched client-side in the SubscriptionBilling component
    // This avoids server-side fetch issues during build time
    const products: any[] = [];

    return (
        <>
            <DashboardHeader
                heading='Settings'
                subheading='Manage your account settings and preferences'
            />

            <div className='mt-8 space-y-6'>
                <SubscriptionBilling
                    products={products}
                    currentSubscription={currentSubscription}
                    account={account}
                    shouldAutoSync={shouldAutoSync}
                    autoSyncReason={autoSyncReason}
                />

                <InvoiceSection accountId={account.id} />
            </div>
        </>
    );
}
