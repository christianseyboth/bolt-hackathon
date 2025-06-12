import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
    try {
        const { priceId, accountId } = await request.json();

        if (!priceId || !accountId) {
            return NextResponse.json(
                { error: 'Price ID and Account ID are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get the account to get user details
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*, owner_id')
            .eq('id', accountId)
            .single();

        if (accountError || !account) {
            return NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            );
        }

        // Get user details
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        let customerId = account.stripe_customer_id;

        // Create Stripe customer if doesn't exist
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    accountId: accountId,
                    userId: user.id,
                },
            });

            customerId = customer.id;

            // Update account with customer ID
            await supabase
                .from('accounts')
                .update({ stripe_customer_id: customerId })
                .eq('id', accountId);
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/subscription?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/subscription?canceled=true`,
            metadata: {
                accountId: accountId,
                userId: user.id,
            },
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
