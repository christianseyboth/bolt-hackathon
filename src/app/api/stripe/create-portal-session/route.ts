import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil' as any,
});

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Portal session request started');

        const supabase = await createClient();

        // Try to get account ID from request body first
        let accountId: string | undefined;
        try {
            const body = await request.json();
            accountId = body.accountId;
            console.log('📋 Account ID from request:', accountId);
        } catch (error) {
            console.log('⚠️ No request body, falling back to user lookup');
        }

        let stripeCustomerId: string | null = null;

        if (accountId) {
            console.log('🔍 Looking up subscription by account ID:', accountId);
            // Get stripe_customer_id from subscriptions table (single source of truth)
            const { data: subscriptionData, error: subscriptionError } = await supabase
                .from('subscriptions')
                .select('stripe_customer_id')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (subscriptionError) {
                console.error('❌ Subscription lookup error:', subscriptionError);

                // Fallback: try to get from accounts table in case it's still there
                console.log('🔄 Trying fallback lookup in accounts table...');
                const { data: accountData, error: accountError } = await supabase
                    .from('accounts')
                    .select('stripe_customer_id')
                    .eq('id', accountId)
                    .single();

                if (accountError || !accountData?.stripe_customer_id) {
                    console.error('❌ Account lookup also failed:', accountError);
                    return NextResponse.json(
                        { error: 'No subscription or Stripe customer found. Please subscribe to a plan first.' },
                        { status: 404 }
                    );
                }

                stripeCustomerId = accountData.stripe_customer_id;
                console.log('✅ Found stripe_customer_id in accounts table (fallback):', stripeCustomerId);
            } else {
                stripeCustomerId = subscriptionData?.stripe_customer_id;
                console.log('✅ Found stripe_customer_id in subscriptions table:', stripeCustomerId);
            }
        } else {
            console.log('🔍 Looking up account by user');
            // Fall back to finding account by user
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                console.error('❌ User lookup error:', userError);
                return NextResponse.json(
                    { error: 'User not found', details: userError },
                    { status: 404 }
                );
            }

            if (!user) {
                console.error('❌ No user found');
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Get the account ID first
            const { data: accountData, error: accountError } = await supabase
                .from('accounts')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (accountError || !accountData) {
                console.error('❌ Account lookup by user error:', accountError);
                return NextResponse.json(
                    { error: 'Account not found', details: accountError },
                    { status: 404 }
                );
            }

            accountId = accountData.id;
            console.log('✅ Found account ID for user:', accountId);

            // Now get stripe_customer_id from subscriptions table
            const { data: subscriptionData, error: subscriptionError } = await supabase
                .from('subscriptions')
                .select('stripe_customer_id')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (subscriptionError) {
                console.error('❌ Subscription lookup by account error:', subscriptionError);

                // Fallback: try to get from accounts table
                console.log('🔄 Trying fallback lookup in accounts table for user...');
                const { data: accountDataWithCustomer, error: accountCustomerError } = await supabase
                    .from('accounts')
                    .select('stripe_customer_id')
                    .eq('owner_id', user.id)
                    .single();

                if (accountCustomerError || !accountDataWithCustomer?.stripe_customer_id) {
                    console.error('❌ No Stripe customer found in accounts table either:', accountCustomerError);
                    return NextResponse.json(
                        { error: 'No subscription or Stripe customer found. Please subscribe to a plan first.' },
                        { status: 404 }
                    );
                }

                stripeCustomerId = accountDataWithCustomer.stripe_customer_id;
                console.log('✅ Found stripe_customer_id in accounts table (user fallback):', stripeCustomerId);
            } else {
                stripeCustomerId = subscriptionData?.stripe_customer_id;
                console.log('✅ Found stripe_customer_id in subscriptions table for user:', stripeCustomerId);
            }
        }

        if (!stripeCustomerId) {
            console.error('❌ No Stripe customer ID found');
            return NextResponse.json(
                { error: 'No Stripe customer found. Please subscribe to a plan first.' },
                { status: 400 }
            );
        }

        console.log('🔍 Creating Stripe portal session for customer:', stripeCustomerId);

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/subscription`,
        });

        console.log('✅ Portal session created successfully:', portalSession.id);

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('❌ Error creating portal session:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            type: typeof error,
            error: error
        });

        return NextResponse.json(
            {
                error: 'Failed to create portal session',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
