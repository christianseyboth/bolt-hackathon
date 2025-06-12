import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
    try {
        const { accountId } = await request.json();
        console.log('🔧 Testing sync for account:', accountId);

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
        }

        const supabase = await createClient();
        console.log('✅ Supabase client created');

        // Step 1: Test account fetch
        console.log('📋 Step 1: Fetching account...');
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (accountError) {
            console.error('❌ Account fetch error:', accountError);
            return NextResponse.json({ error: `Account fetch failed: ${accountError.message}` }, { status: 500 });
        }

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        console.log('✅ Account found:', {
            id: account.id,
            stripe_customer_id: account.stripe_customer_id,
            current_plan: account.plan
        });

        if (!account.stripe_customer_id) {
            return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 });
        }

        // Step 2: Test Stripe connection
        console.log('📋 Step 2: Testing Stripe connection...');
        try {
            const customer = await stripe.customers.retrieve(account.stripe_customer_id);
            console.log('✅ Stripe customer found:', customer.id);
        } catch (stripeError) {
            console.error('❌ Stripe customer error:', stripeError);
            return NextResponse.json({ error: `Stripe error: ${stripeError}` }, { status: 500 });
        }

        // Step 3: Test subscription fetch
        console.log('📋 Step 3: Fetching subscriptions...');
        const subscriptions = await stripe.subscriptions.list({
            customer: account.stripe_customer_id,
            status: 'active',
            limit: 1
        });

        console.log('✅ Subscriptions found:', subscriptions.data.length);

        if (subscriptions.data.length === 0) {
            return NextResponse.json({
                error: 'No active subscriptions found in Stripe',
                customer_id: account.stripe_customer_id,
                all_subscriptions: await stripe.subscriptions.list({ customer: account.stripe_customer_id })
            }, { status: 404 });
        }

        const subscription = subscriptions.data[0];
        console.log('✅ Active subscription:', {
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end
        });

        // Step 4: Test database tables
        console.log('📋 Step 4: Testing database tables...');

        // Check if subscriptions table exists and what columns it has
        const { error: tableError } = await supabase
            .from('subscriptions')
            .select('*')
            .limit(1);

        if (tableError) {
            console.error('❌ Subscriptions table error:', tableError);
            return NextResponse.json({ error: `Database table error: ${tableError.message}` }, { status: 500 });
        }

        console.log('✅ Subscriptions table accessible');

        return NextResponse.json({
            success: true,
            message: 'All tests passed!',
            data: {
                account_id: account.id,
                stripe_customer_id: account.stripe_customer_id,
                subscription_id: subscription.id,
                subscription_status: subscription.status,
                price_id: subscription.items.data[0]?.price.id
            }
        });

    } catch (error) {
        console.error('❌ Test sync error:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });

        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Test failed',
            details: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
