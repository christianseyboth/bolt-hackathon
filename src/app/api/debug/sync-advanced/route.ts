import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
    let accountId: string | undefined;

    try {
        console.log('🚀 Starting advanced sync process...');

        // Step 1: Parse request
        const body = await request.json();
        accountId = body.accountId;
        const forceImmediate = body.forceImmediate || false; // New option for immediate upgrade

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
        }

        // Step 2: Get account
        const supabase = await createClient();
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (accountError || !account?.stripe_customer_id) {
            return NextResponse.json({ error: 'Account not found or missing Stripe customer ID' }, { status: 404 });
        }

        // Step 3: Get ALL subscriptions for this customer (active, scheduled, etc.)
        console.log('🔍 Fetching all subscriptions...');
        const allSubscriptions = await stripe.subscriptions.list({
            customer: account.stripe_customer_id,
            limit: 10, // Get more to see scheduled ones
            expand: ['data.items.data.price']
        });

        console.log(`📋 Found ${allSubscriptions.data.length} total subscriptions`);

        // Categorize subscriptions
        const activeSubscriptions = allSubscriptions.data.filter(sub => sub.status === 'active');
        const scheduledSubscriptions = allSubscriptions.data.filter(sub =>
            sub.status === 'trialing' || sub.metadata?.scheduled === 'true'
        );

        console.log(`📊 Breakdown: ${activeSubscriptions.length} active, ${scheduledSubscriptions.length} scheduled`);

        let subscriptionToUse;
        let reason = '';

        if (forceImmediate && scheduledSubscriptions.length > 0) {
            // User wants to force immediate upgrade
            subscriptionToUse = scheduledSubscriptions[0];
            reason = 'Forced immediate upgrade to scheduled subscription';

            // Optionally cancel old subscription immediately
            if (activeSubscriptions.length > 0) {
                console.log('🗑️ Cancelling old subscription for immediate upgrade...');
                await stripe.subscriptions.cancel(activeSubscriptions[0].id);
            }
        } else if (activeSubscriptions.length > 0) {
            // Use currently active subscription
            subscriptionToUse = activeSubscriptions[0];
            reason = 'Using currently active subscription';
        } else if (scheduledSubscriptions.length > 0) {
            // No active, but have scheduled
            subscriptionToUse = scheduledSubscriptions[0];
            reason = 'No active subscription, using scheduled subscription';
        } else {
            return NextResponse.json({
                error: 'No active or scheduled subscriptions found',
                allSubscriptions: allSubscriptions.data.map(sub => ({
                    id: sub.id,
                    status: sub.status,
                    price: sub.items.data[0]?.price.id
                }))
            }, { status: 404 });
        }

        console.log(`✅ Selected subscription: ${subscriptionToUse.id} (${reason})`);

        // Step 4: Process the selected subscription
        const priceId = subscriptionToUse.items.data[0]?.price.id;
        const planName = getPlanNameFromPriceId(priceId);

        const subscriptionData = {
            subscription_status: forceImmediate ? 'active' : subscriptionToUse.status,
            plan_name: planName,
            current_period_start: new Date(subscriptionToUse.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscriptionToUse.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscriptionToUse.cancel_at_period_end,
            updated_at: new Date().toISOString(),
            seats: getSeatsFromPlan(planName),
            price_per_seat: subscriptionToUse.items.data[0]?.price.unit_amount ? subscriptionToUse.items.data[0].price.unit_amount / 100 : 0,
            total_price: subscriptionToUse.items.data[0]?.price.unit_amount ? subscriptionToUse.items.data[0].price.unit_amount / 100 : 0,
            analysis_amount: getAnalysisAmountFromPlan(planName),
            stripe_subscription_id: subscriptionToUse.id,
        };

        // Step 5: Update database
        const { data: updateResult, error: updateError } = await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('account_id', accountId)
            .select();

        if (updateError) {
            console.error('❌ Subscription update error:', updateError);
            throw updateError;
        }

        // ✅ REMOVED: No longer update accounts table - subscriptions table is single source of truth

        // Step 6: Return detailed response
        return NextResponse.json({
            success: true,
            message: `Subscription synced successfully: ${reason}`,
            subscription: {
                plan_name: planName,
                status: subscriptionData.subscription_status,
                stripe_subscription_id: subscriptionToUse.id,
                seats: subscriptionData.seats
            },
            analysis: {
                total_subscriptions: allSubscriptions.data.length,
                active_subscriptions: activeSubscriptions.length,
                scheduled_subscriptions: scheduledSubscriptions.length,
                reason: reason,
                forced_immediate: forceImmediate
            },
            all_subscriptions: allSubscriptions.data.map(sub => ({
                id: sub.id,
                status: sub.status,
                plan: getPlanNameFromPriceId(sub.items.data[0]?.price.id),
                period_end: new Date(sub.current_period_end * 1000).toISOString()
            }))
        });

    } catch (error) {
        console.error('❌ Advanced sync error:', error);
        return NextResponse.json({
            error: 'Advanced sync failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            accountId
        }, { status: 500 });
    }
}

function getPlanNameFromPriceId(priceId: string): string {
    const priceToplanMap: Record<string, string> = {
        'price_1RZ9HkCsZBRpsVkXiDJ1KICM': 'Team', // Team YEARLY
        'price_1RZ9HkCsZBRpsVkXBQNNjw87': 'Team', // Team MONTHLY
        'price_1RZ9EoCsZBRpsVkXVniKqUeU': 'Entrepreneur', // Entrepreneur YEARLY
        'price_1RZ9EoCsZBRpsVkXxzMu3paC': 'Entrepreneur', // Entrepreneur MONTHLY
        'price_1RZ9CfCsZBRpsVkXUefPaqVu': 'Solo', // Solo YEARLY
        'price_1RZ9CfCsZBRpsVkXt0nTDOee': 'Solo', // Solo MONTHLY
    };

    return priceToplanMap[priceId] || 'Free';
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

function getSeatsFromPlan(planName: string): number {
    const planSeats: Record<string, number> = {
        'Free': 1,
        'Solo': 1,
        'Entrepreneur': 5,
        'Team': 20,
    };

    return planSeats[planName] || 1;
}
