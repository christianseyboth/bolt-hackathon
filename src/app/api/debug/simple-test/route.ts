import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Simple test starting...');

        const { accountId } = await request.json();
        console.log('Account ID:', accountId);

        // Test 1: Database connection
        const supabase = await createClient();
        console.log('✅ Database connected');

        // Test 2: Get account
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (accountError) {
            console.error('Account error:', accountError);
            return NextResponse.json({ error: 'Account fetch failed', details: accountError }, { status: 500 });
        }

        console.log('✅ Account found:', account.email);
        console.log('Stripe customer ID:', account.stripe_customer_id);

        // Test 3: Stripe connection
        if (!account.stripe_customer_id) {
            return NextResponse.json({ error: 'No Stripe customer ID' }, { status: 400 });
        }

        const customer = await stripe.customers.retrieve(account.stripe_customer_id);
        console.log('✅ Stripe customer found:', customer.id);

        // Test 4: Get subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: account.stripe_customer_id,
            limit: 5
        });

        console.log('✅ Subscriptions found:', subscriptions.data.length);

        if (subscriptions.data.length > 0) {
            const sub = subscriptions.data[0];
            console.log('First subscription:', {
                id: sub.id,
                status: sub.status,
                current_period_start: sub.current_period_start,
                current_period_end: sub.current_period_end,
                items: sub.items.data.length
            });

            if (sub.items.data.length > 0) {
                console.log('First item price:', sub.items.data[0].price.id);
            }
        }

        return NextResponse.json({
            success: true,
            account: {
                id: account.id,
                email: account.email,
                stripe_customer_id: account.stripe_customer_id
            },
            subscriptions: subscriptions.data.map(sub => ({
                id: sub.id,
                status: sub.status,
                price_id: sub.items.data[0]?.price.id
            }))
        });

    } catch (error) {
        console.error('❌ Simple test error:', error);
        return NextResponse.json({
            error: 'Test failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
