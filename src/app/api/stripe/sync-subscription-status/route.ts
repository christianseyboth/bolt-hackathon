import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
    try {
        const { accountId } = await request.json();

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get user authentication
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError || !data.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get account details (minimal - just for verification)
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('id, owner_id')
            .eq('id', accountId)
            .eq('owner_id', data.user.id)
            .single();

        if (accountError || !account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Get current subscription (single source of truth)
        const { data: currentSubscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (subError || !currentSubscription) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
        }

        if (!currentSubscription.stripe_customer_id) {
            return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 });
        }

        console.log('🔄 Syncing subscription status for account:', accountId);

        // Fetch all subscriptions from Stripe for this customer
        const subscriptions = await stripe.subscriptions.list({
            customer: currentSubscription.stripe_customer_id,
            limit: 10,
        });

        console.log('📊 Found', subscriptions.data.length, 'subscriptions in Stripe');

        if (subscriptions.data.length === 0) {
            // No subscriptions in Stripe - user should be on free plan
            console.log('🆓 No subscriptions found, setting to Free plan');

            const { data: freeUpdateResult, error: freeUpdateError } = await supabase
                .from('subscriptions')
                .update({
                    subscription_status: 'cancelled',
                    plan_name: 'Free',
                    cancel_at_period_end: false,
                    seats: 1,
                    price_per_seat: 0,
                    total_price: 0,
                    analysis_amount: 100,
                    current_period_start: new Date().toISOString(),
                    current_period_end: null,
                    stripe_subscription_id: null,
                    stripe_customer_id: currentSubscription.stripe_customer_id, // Keep customer ID
                    emails_left: 100,
                    updated_at: new Date().toISOString(),
                })
                .eq('account_id', accountId)
                .select();

            if (freeUpdateError) {
                console.error('❌ Failed to update subscription to Free plan:', freeUpdateError);
                return NextResponse.json({
                    error: 'Failed to update subscription to Free plan',
                    details: freeUpdateError.message
                }, { status: 500 });
            }

            console.log('✅ Successfully updated subscription to Free plan:', freeUpdateResult);

            return NextResponse.json({
                success: true,
                message: 'Account reverted to Free plan - no active subscriptions found',
                status: 'free',
            });
        }

        // Find the most recent subscription
        const latestSubscription = subscriptions.data[0];
        console.log('🔍 Latest subscription:', {
            id: latestSubscription.id,
            status: latestSubscription.status,
            cancel_at_period_end: latestSubscription.cancel_at_period_end,
            current_period_end: latestSubscription.current_period_end,
        });

        // Determine what the account status should be based on Stripe
        let shouldBeFreePlan = false;
        let subscriptionStatus = latestSubscription.status;

        if (latestSubscription.status === 'canceled') {
            shouldBeFreePlan = true;
        } else if (latestSubscription.status === 'incomplete_expired' ||
                   latestSubscription.status === 'past_due') {
            shouldBeFreePlan = true;
            subscriptionStatus = 'canceled';
        } else if (latestSubscription.cancel_at_period_end) {
            // Check if the subscription has actually ended
            const now = new Date();
            const endDate = new Date(latestSubscription.current_period_end * 1000);

            if (endDate <= now) {
                shouldBeFreePlan = true;
                subscriptionStatus = 'canceled';
            }
        }

        console.log('🎯 Subscription analysis:', {
            shouldBeFreePlan,
            subscriptionStatus,
            stripeStatus: latestSubscription.status,
        });

        if (shouldBeFreePlan) {
            console.log('🔄 Converting to Free plan...');

            const { data: expiredUpdateResult, error: expiredUpdateError } = await supabase
                .from('subscriptions')
                .update({
                    plan_name: 'Free',
                    subscription_status: 'active', // Free plan is active
                    cancel_at_period_end: false,
                    seats: 1,
                    price_per_seat: 0,
                    total_price: 0,
                    analysis_amount: 100,
                    current_period_start: new Date().toISOString(),
                    current_period_end: null,
                    stripe_subscription_id: null,
                    emails_left: 100,
                    updated_at: new Date().toISOString(),
                })
                .eq('account_id', accountId)
                .select();

            if (expiredUpdateError) {
                console.error('❌ Failed to update expired subscription to Free plan:', expiredUpdateError);
                return NextResponse.json({
                    error: 'Failed to update expired subscription to Free plan',
                    details: expiredUpdateError.message
                }, { status: 500 });
            }

            console.log('✅ Successfully updated expired subscription to Free plan:', expiredUpdateResult);

            return NextResponse.json({
                success: true,
                message: 'Subscription updated to Free plan - subscription has ended',
                status: 'free',
                planName: 'Free',
                stripeSubscriptionStatus: latestSubscription.status,
            });
        }

        // If we reach here, the subscription is active and should be synced
        // Get price details to determine plan
        const priceId = latestSubscription.items.data[0]?.price.id;
        const planName = await getPlanNameFromPriceId(priceId);

        if (!planName) {
            console.error('❌ Could not determine plan name from price ID:', priceId);
            return NextResponse.json({ error: 'Could not determine plan name' }, { status: 400 });
        }

        console.log('📋 Determined plan:', planName);

        // Update subscription in database with all current Stripe data
        console.log('🔄 Updating subscription in database with Stripe data...');
        const { data: syncUpdateResult, error: syncUpdateError } = await supabase
            .from('subscriptions')
            .update({
                subscription_status: latestSubscription.status,
                plan_name: planName,
                stripe_subscription_id: latestSubscription.id,
                stripe_customer_id: currentSubscription.stripe_customer_id, // Ensure customer ID is maintained
                cancel_at_period_end: latestSubscription.cancel_at_period_end,
                current_period_start: new Date(latestSubscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(latestSubscription.current_period_end * 1000).toISOString(),
                seats: getSeatsFromPlan(planName),
                price_per_seat: latestSubscription.items.data[0]?.price.unit_amount ? latestSubscription.items.data[0].price.unit_amount / 100 : 0,
                total_price: latestSubscription.items.data[0]?.price.unit_amount ? latestSubscription.items.data[0].price.unit_amount / 100 : 0,
                analysis_amount: getAnalysisAmountFromPlan(planName),
                updated_at: new Date().toISOString(),
            })
            .eq('account_id', accountId)
            .select();

        if (syncUpdateError) {
            console.error('❌ Failed to update subscription in database:', syncUpdateError);
            return NextResponse.json({
                error: 'Failed to update subscription in database',
                details: syncUpdateError.message
            }, { status: 500 });
        }

        console.log('✅ Successfully updated subscription to match Stripe:', { planName, updateResult: syncUpdateResult });

        return NextResponse.json({
            success: true,
            message: `Subscription synced successfully - ${planName} plan`,
            status: 'active',
            planName,
            stripeSubscriptionStatus: latestSubscription.status,
        });

    } catch (error) {
        console.error('❌ Sync error:', error);
        return NextResponse.json({
            error: 'Failed to sync subscription status',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Helper functions for plan mapping
async function getPlanNameFromPriceId(priceId: string): Promise<string | null> {
    // Map price IDs to plan names based on the price ID you're seeing
    const priceToPlans: Record<string, string> = {
        // Current price IDs
        'price_1RZ9HkCsZBRpsVkXiDJ1KICM': 'Team', // Team YEARLY
        'price_1RZ9HkCsZBRpsVkXBQNNjw87': 'Team', // Team MONTHLY
        'price_1RZ9EoCsZBRpsVkXVniKqUeU': 'Entrepreneur', // Entrepreneur YEARLY
        'price_1RZ9EoCsZBRpsVkXxzMu3paC': 'Entrepreneur', // Entrepreneur MONTHLY
        'price_1RZ9CfCsZBRpsVkXUefPaqVu': 'Solo', // Solo YEARLY
        'price_1RZ9CfCsZBRpsVkXt0nTDOee': 'Solo', // Solo MONTHLY - This is your price ID!

        // Legacy/backup price IDs (keep for backward compatibility)
        'price_1QKvr6P1PkxNKhO76LR6FHvU': 'Pro',
        'price_1QKvrCP1PkxNKhO7HkIZRGj7': 'Pro',
        'price_1QKvs5P1PkxNKhO7CILWcjpP': 'Enterprise',
        'price_1QKvs9P1PkxNKhO7VaQCO5nQ': 'Enterprise',
    };

    return priceToPlans[priceId] || null;
}

function getSeatsFromPlan(planName: string): number {
    const planSeats: Record<string, number> = {
        'Free': 1,
        'Solo': 1,
        'Entrepreneur': 5,
        'Team': 10,
        // Legacy plans
        'Pro': 5,
        'Enterprise': 20,
    };
    return planSeats[planName] || 1;
}

function getAnalysisAmountFromPlan(planName: string): number {
    const planAnalysis: Record<string, number> = {
        'Free': 5,
        'Solo': 10,
        'Entrepreneur': 30,
        'Team': 100,
        // Legacy plans
        'Pro': 1000,
        'Enterprise': 5000,
    };
    return planAnalysis[planName] || 5;
}
