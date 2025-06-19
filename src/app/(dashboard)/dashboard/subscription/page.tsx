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

    // Fetch Stripe products
    let products = [];
    let usingMockData = false;

    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            (process.env.NODE_ENV === 'production'
                ? 'https://secpilot.io'
                : 'http://localhost:3000');

        console.log('Fetching products from:', `${baseUrl}/api/stripe/products`);

        const response = await fetch(`${baseUrl}/api/stripe/products`, {
            cache: 'no-store',
        });

        console.log('Products API response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            products = data.products || [];
            console.log('Products fetched from Stripe:', products.length, 'products');
            console.log('Product data structure:', JSON.stringify(products, null, 2));
        } else {
            const errorText = await response.text();
            console.error('Failed to fetch products, status:', response.status);
            console.error('Error response:', errorText);
            usingMockData = true;
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        usingMockData = true;
        // Fallback to mock data for development
        products = [
            {
                id: 'prod_mock_solo',
                name: 'Solo',
                description: 'Perfect for individual professionals',
                metadata: {},
                prices: [
                    {
                        id: 'price_mock_solo_monthly',
                        amount: 1900,
                        currency: 'usd',
                        interval: 'month',
                        interval_count: 1,
                    },
                    {
                        id: 'price_mock_solo_yearly',
                        amount: 19000,
                        currency: 'usd',
                        interval: 'year',
                        interval_count: 1,
                    },
                ],
            },
            {
                id: 'prod_mock_entrepreneur',
                name: 'Entrepreneur',
                description: 'Ideal for growing businesses',
                metadata: {},
                prices: [
                    {
                        id: 'price_mock_entrepreneur_monthly',
                        amount: 4900,
                        currency: 'usd',
                        interval: 'month',
                        interval_count: 1,
                    },
                    {
                        id: 'price_mock_entrepreneur_yearly',
                        amount: 49000,
                        currency: 'usd',
                        interval: 'year',
                        interval_count: 1,
                    },
                ],
            },
            {
                id: 'prod_mock_team',
                name: 'Team',
                description: 'Advanced features for teams',
                metadata: {},
                prices: [
                    {
                        id: 'price_mock_team_monthly',
                        amount: 9900,
                        currency: 'usd',
                        interval: 'month',
                        interval_count: 1,
                    },
                    {
                        id: 'price_mock_team_yearly',
                        amount: 99000,
                        currency: 'usd',
                        interval: 'year',
                        interval_count: 1,
                    },
                ],
            },
        ];
    }

    if (usingMockData) {
        console.log('Using mock data for products. Check your Stripe API keys and connection.');
    }

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
