import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
    try {
        const { accountId } = await request.json();

        console.log('🚀 Sync after checkout started for account:', accountId);

        if (!accountId) {
            console.error('❌ No account ID provided');
            return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get account info
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('billing_email')
            .eq('id', accountId)
            .single();

        console.log('📧 Account lookup result:', { account: account?.billing_email, error: accountError });

        if (accountError || !account) {
            console.error('❌ Account not found:', accountError);
            return NextResponse.json({ error: 'Account not found', details: accountError }, { status: 404 });
        }

                // Get subscription - first try NULL customer ID, then try any subscription for this account
        let { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .is('stripe_customer_id', null)
            .single();

        console.log('🔍 Subscription lookup (NULL customer ID):', {
            found: !!subscription,
            error: subError,
            hasCustomerId: subscription?.stripe_customer_id
        });

        // If no subscription with NULL customer ID, get the most recent subscription for this account
        if (subError || !subscription) {
            console.log('🔍 No subscription with NULL customer ID, looking for any subscription...');
            const { data: anySubscription, error: anySubError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('account_id', accountId)
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            console.log('🔍 Any subscription lookup result:', {
                found: !!anySubscription,
                error: anySubError,
                hasCustomerId: anySubscription?.stripe_customer_id,
                planName: anySubscription?.plan_name
            });

            if (anySubError || !anySubscription) {
                console.error('❌ No subscription found for this account:', anySubError);
                return NextResponse.json({
                    error: 'No subscription found for this account',
                    details: anySubError,
                    debug: 'Looked for both NULL and any subscription'
                }, { status: 404 });
            }

            subscription = anySubscription;
        }

                // Find Stripe customer by email
        console.log('🔍 Looking for Stripe customer with email:', account.billing_email);
        const customers = await stripe.customers.list({
            email: account.billing_email,
            limit: 1
        });

        console.log('👤 Stripe customer search result:', {
            found: customers.data.length,
            customers: customers.data.map(c => ({ id: c.id, email: c.email }))
        });

        if (customers.data.length === 0) {
            console.error('❌ No Stripe customer found with email:', account.billing_email);
            return NextResponse.json({
                error: 'No Stripe customer found',
                email: account.billing_email
            }, { status: 404 });
        }

        const customer = customers.data[0];
        console.log('✅ Found Stripe customer:', { id: customer.id, email: customer.email });

        // Get the customer's subscriptions (not just active ones, as they might be in different states)
        console.log('🔍 Looking for subscriptions for customer:', customer.id);
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            limit: 10, // Get more to see all subscriptions
            expand: ['data.items.data.price']
        });

        console.log('📋 Stripe subscriptions found:', subscriptions.data.map(s => ({
            id: s.id,
            status: s.status,
            created: new Date(s.created * 1000).toISOString()
        })));

        if (subscriptions.data.length === 0) {
            console.error('❌ No Stripe subscriptions found for customer:', customer.id);
            return NextResponse.json({
                error: 'No Stripe subscription found',
                customerId: customer.id
            }, { status: 404 });
        }

        // Get the most recent subscription (prefer active, but take any if no active)
        const stripeSubscription = subscriptions.data.find(s => s.status === 'active') || subscriptions.data[0];
        console.log('🎯 Using subscription:', {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            created: new Date(stripeSubscription.created * 1000).toISOString()
        });

        // Get plan details
        const priceId = stripeSubscription.items.data[0]?.price.id;
        const planName = getPlanNameFromPriceId(priceId);

        console.log('📋 Plan details:', { priceId, planName });

        // Safe date conversion
        const safeDate = (timestamp: number | undefined | null, fieldName: string) => {
            console.log(`Converting ${fieldName}:`, timestamp);

            if (!timestamp) {
                console.log(`${fieldName} is null/undefined, returning null`);
                return null;
            }

            try {
                const date = new Date(timestamp * 1000);
                if (isNaN(date.getTime())) {
                    console.error(`Invalid date for ${fieldName}:`, timestamp);
                    return null;
                }
                const isoString = date.toISOString();
                console.log(`${fieldName} converted to:`, isoString);
                return isoString;
            } catch (error) {
                console.error(`Error converting ${fieldName}:`, error);
                return null;
            }
        };

        const updateData = {
            stripe_customer_id: customer.id,
            stripe_subscription_id: stripeSubscription.id,
            subscription_status: stripeSubscription.status,
            plan_name: planName,
            current_period_start: safeDate(stripeSubscription.current_period_start, 'current_period_start'),
            current_period_end: safeDate(stripeSubscription.current_period_end, 'current_period_end'),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            seats: getSeatsFromPlan(planName),
            price_per_seat: stripeSubscription.items.data[0]?.price.unit_amount ? stripeSubscription.items.data[0].price.unit_amount / 100 : 0,
            total_price: stripeSubscription.items.data[0]?.price.unit_amount ? stripeSubscription.items.data[0].price.unit_amount / 100 : 0,
            analysis_amount: getAnalysisAmountFromPlan(planName),
            updated_at: new Date().toISOString(),
        };

        console.log('💾 Updating subscription with data:', updateData);

        // Update the subscription record
        const { data: updateResult, error: updateError } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('account_id', accountId)
            .select();

        if (updateError) {
            console.error('❌ Failed to update subscription:', updateError);
            return NextResponse.json({
                error: 'Failed to update subscription',
                details: updateError
            }, { status: 500 });
        }

        console.log('✅ Subscription updated successfully:', updateResult);

        return NextResponse.json({
            success: true,
            message: 'Subscription synced successfully',
            planName,
            customerId: customer.id,
            subscriptionId: stripeSubscription.id,
            updateResult
        });

    } catch (error) {
        console.error('❌ Sync after checkout error:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json({
            error: 'Failed to sync subscription',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}

function getPlanNameFromPriceId(priceId: string): string {
    const priceToPlans: Record<string, string> = {
        'price_1RZ9HkCsZBRpsVkXiDJ1KICM': 'Team',
        'price_1RZ9HkCsZBRpsVkXBQNNjw87': 'Team',
        'price_1RZ9EoCsZBRpsVkXVniKqUeU': 'Entrepreneur',
        'price_1RZ9EoCsZBRpsVkXxzMu3paC': 'Entrepreneur',
        'price_1RZ9CfCsZBRpsVkXUefPaqVu': 'Solo',
        'price_1RZ9CfCsZBRpsVkXt0nTDOee': 'Solo',
    };
    return priceToPlans[priceId] || 'Free';
}

function getSeatsFromPlan(planName: string): number {
    const planSeats: Record<string, number> = {
        'Free': 1,
        'Solo': 1,
        'Entrepreneur': 5,
        'Team': 10,
    };
    return planSeats[planName] || 1;
}

function getAnalysisAmountFromPlan(planName: string): number {
    const planAnalysis: Record<string, number> = {
        'Free': 100,
        'Solo': 500,
        'Entrepreneur': 2000,
        'Team': 5000,
    };
    return planAnalysis[planName] || 100;
}
