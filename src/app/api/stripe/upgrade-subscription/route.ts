import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
    try {
        const { newPriceId, accountId } = await request.json();

        if (!newPriceId || !accountId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get account and current subscription
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (accountError || !account?.stripe_customer_id) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Get current active subscription from Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: account.stripe_customer_id,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        const currentSubscription = subscriptions.data[0];
        const currentSubscriptionItem = currentSubscription.items.data[0];

        // Upgrade/downgrade with immediate proration
        const updatedSubscription = await stripe.subscriptions.update(currentSubscription.id, {
            items: [{
                id: currentSubscriptionItem.id,
                price: newPriceId,
            }],
            proration_behavior: 'always_invoice', // Immediate upgrade with proration
            expand: ['items.data.price']
        });

        // Update database immediately
        const planName = getPlanNameFromPriceId(newPriceId);
        const subscriptionData = {
            plan_name: planName,
            seats: getSeatsFromPlan(planName),
            price_per_seat: updatedSubscription.items.data[0]?.price.unit_amount ? updatedSubscription.items.data[0].price.unit_amount / 100 : 0,
            total_price: updatedSubscription.items.data[0]?.price.unit_amount ? updatedSubscription.items.data[0].price.unit_amount / 100 : 0,
            analysis_amount: getAnalysisAmountFromPlan(planName),
            updated_at: new Date().toISOString(),
        };

        // Update subscription in database
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('account_id', accountId);

        if (updateError) {
            console.error('Database update error:', updateError);
            // Don't fail the request - webhook will handle it
        }

        // Update account table
        await supabase
            .from('accounts')
            .update({
                plan: planName,
                stripe_subscription_id: updatedSubscription.id, // ⭐ Fix: Store Stripe subscription ID
                updated_at: new Date().toISOString(),
            })
            .eq('id', accountId);

        return NextResponse.json({
            success: true,
            message: 'Subscription upgraded successfully',
            subscription: {
                id: updatedSubscription.id,
                plan_name: planName,
                seats: getSeatsFromPlan(planName),
                status: updatedSubscription.status
            }
        });

    } catch (error) {
        console.error('Subscription upgrade error:', error);
        return NextResponse.json({
            error: 'Failed to upgrade subscription',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

function getPlanNameFromPriceId(priceId: string): string {
    const priceToplanMap: Record<string, string> = {
        'price_1RZ9HkCsZBRpsVkXiDJ1KICM': 'Team',
        'price_1RZ9HkCsZBRpsVkXBQNNjw87': 'Team',
        'price_1RZ9EoCsZBRpsVkXVniKqUeU': 'Entrepreneur',
        'price_1RZ9EoCsZBRpsVkXxzMu3paC': 'Entrepreneur',
        'price_1RZ9CfCsZBRpsVkXUefPaqVu': 'Solo',
        'price_1RZ9CfCsZBRpsVkXt0nTDOee': 'Solo',
    };

    return priceToplanMap[priceId] || 'Free';
}

function getSeatsFromPlan(planName: string): number {
    const planSeats: Record<string, number> = {
        'Free': 1,
        'Solo': 1,
        'Entrepreneur': 5,
        'Team': 20,
    };

    return planSeats[planName] || 1;
}

function getAnalysisAmountFromPlan(planName: string): number {
    const planLimits: Record<string, number> = {
        'Free': 100,
        'Solo': 1000,
        'Entrepreneur': 5000,
        'Team': 20000,
    };

    return planLimits[planName] || 100;
}
