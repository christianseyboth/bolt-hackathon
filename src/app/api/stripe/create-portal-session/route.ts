import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
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

        let account;

        if (accountId) {
            console.log('🔍 Looking up account by ID:', accountId);
            // Use provided account ID
            const { data: accountData, error: accountError } = await supabase
                .from('accounts')
                .select('stripe_customer_id')
                .eq('id', accountId)
                .single();

            if (accountError) {
                console.error('❌ Account lookup error:', accountError);
                return NextResponse.json(
                    { error: 'Account not found', details: accountError },
                    { status: 404 }
                );
            }

            if (!accountData) {
                console.error('❌ No account data returned');
                return NextResponse.json(
                    { error: 'Account not found' },
                    { status: 404 }
                );
            }

            account = accountData;
            console.log('✅ Account found:', { stripe_customer_id: account.stripe_customer_id });
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

            // Get the account for this user
            const { data: accountData, error: accountError } = await supabase
                .from('accounts')
                .select('stripe_customer_id')
                .eq('owner_id', user.id)
                .single();

            if (accountError) {
                console.error('❌ Account lookup by user error:', accountError);
                return NextResponse.json(
                    { error: 'Account not found', details: accountError },
                    { status: 404 }
                );
            }

            if (!accountData) {
                console.error('❌ No account data for user');
                return NextResponse.json(
                    { error: 'Account not found' },
                    { status: 404 }
                );
            }

            account = accountData;
            console.log('✅ Account found by user:', { stripe_customer_id: account.stripe_customer_id });
        }

        if (!account.stripe_customer_id) {
            console.error('❌ No Stripe customer ID found');
            return NextResponse.json(
                { error: 'No Stripe customer found. Please subscribe to a plan first.' },
                { status: 400 }
            );
        }

        console.log('🔍 Creating Stripe portal session for customer:', account.stripe_customer_id);

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: account.stripe_customer_id,
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
