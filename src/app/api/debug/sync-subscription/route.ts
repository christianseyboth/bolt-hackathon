import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
    let accountId: string | undefined;

    try {
        console.log('🚀 Starting sync process...');

        // Step 1: Parse request
        try {
            const body = await request.json();
            accountId = body.accountId;
            console.log('✅ Step 1: Request parsed, accountId:', accountId);
        } catch (error) {
            console.error('❌ Step 1 failed - Request parsing error:', error);
            return NextResponse.json({ error: 'Invalid request body', step: 1 }, { status: 400 });
        }

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID required', step: 1 }, { status: 400 });
        }

        // Step 2: Database connection
        let supabase;
        try {
            supabase = await createClient();
            console.log('✅ Step 2: Database client created');
        } catch (error) {
            console.error('❌ Step 2 failed - Database connection error:', error);
            return NextResponse.json({ error: 'Database connection failed', step: 2 }, { status: 500 });
        }

        // Step 3: Get account and subscription
        let account, subscription_record;
        try {
            const { data: accountData, error: accountError } = await supabase
                .from('accounts')
                .select('*')
                .eq('id', accountId)
                .single();

            if (accountError) throw accountError;
            account = accountData;
            console.log('✅ Step 3a: Account retrieved:', account?.billing_email);

            // Get subscription record (which has the stripe_customer_id)
            const { data: subscriptionData, error: subscriptionError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (subscriptionError) throw subscriptionError;
            subscription_record = subscriptionData;
            console.log('✅ Step 3b: Subscription retrieved:', subscription_record?.plan_name);
        } catch (error) {
            console.error('❌ Step 3 failed - Account/subscription fetch error:', error);
            return NextResponse.json({ error: 'Account or subscription not found', step: 3 }, { status: 404 });
        }

        if (!subscription_record?.stripe_customer_id) {
            return NextResponse.json({ error: 'No Stripe customer ID found in subscription', step: 3 }, { status: 400 });
        }

        // Step 4: Get Stripe subscription
        let subscription;
        try {
            // First try to get all subscriptions (don't filter by status)
            const subscriptions = await stripe.subscriptions.list({
                customer: subscription_record.stripe_customer_id,
                limit: 10,  // Get more to see all statuses
                expand: ['data.items.data.price']
            });

            console.log('🔍 Found subscriptions in Stripe:', subscriptions.data.map(sub => ({
                id: sub.id,
                status: sub.status,
                cancel_at_period_end: sub.cancel_at_period_end
            })));

            if (subscriptions.data.length === 0) {
                return NextResponse.json({ error: 'No subscriptions found in Stripe', step: 4 }, { status: 404 });
            }

            // Find the most relevant subscription (prefer active, then any other status)
            subscription = subscriptions.data.find(sub => sub.status === 'active') || subscriptions.data[0];

            console.log('🎯 Using subscription:', {
                id: subscription.id,
                status: subscription.status,
                plan: subscription.items.data[0]?.price?.nickname || 'Unknown'
            });

            // If timestamps are missing, fetch the subscription directly
            if (!subscription.current_period_start || !subscription.current_period_end) {
                console.log('⚠️ Missing timestamps, fetching subscription directly...');
                subscription = await stripe.subscriptions.retrieve(subscription.id, {
                    expand: ['items.data.price']
                });
            }

            console.log('✅ Step 4: Stripe subscription retrieved:', subscription.id);
            console.log('Subscription periods:', {
                start: subscription.current_period_start,
                end: subscription.current_period_end
            });
        } catch (error) {
            console.error('❌ Step 4 failed - Stripe API error:', error);
            return NextResponse.json({ error: 'Failed to fetch Stripe subscription', step: 4 }, { status: 500 });
        }

        // Step 5: Process subscription data
        let subscriptionData;
        try {
            console.log('🔍 Step 5a: Getting price ID...');
            const priceId = subscription.items.data[0]?.price.id;
            console.log('✅ Step 5a: Price ID:', priceId);

            console.log('🔍 Step 5b: Getting plan name...');
            const planName = await getPlanNameFromPriceId(priceId);
            console.log('✅ Step 5b: Plan name:', planName);

            console.log('🔍 Step 5c: Processing timestamps...');

            // Get timestamps from subscription items (not the subscription object itself)
            const subscriptionItem = subscription.items.data[0];
            const startTimestamp = subscriptionItem?.current_period_start || subscription.current_period_start;
            const endTimestamp = subscriptionItem?.current_period_end || subscription.current_period_end;

            console.log('Raw timestamps from subscription:', {
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end
            });

            console.log('Raw timestamps from subscription item:', {
                current_period_start: subscriptionItem?.current_period_start,
                current_period_end: subscriptionItem?.current_period_end
            });

            console.log('Using timestamps:', {
                start: startTimestamp,
                end: endTimestamp
            });

            // Safe date conversion
            const safeDate = (timestamp: number | undefined, fieldName: string) => {
                console.log(`Converting ${fieldName} timestamp:`, timestamp);

                if (timestamp === undefined || timestamp === null) {
                    throw new Error(`${fieldName} timestamp is undefined/null`);
                }

                if (isNaN(timestamp)) {
                    throw new Error(`${fieldName} timestamp is not a number: ${timestamp}`);
                }

                const date = new Date(timestamp * 1000);
                console.log(`Converted ${fieldName} date:`, date);

                if (isNaN(date.getTime())) {
                    throw new Error(`Invalid date from ${fieldName} timestamp: ${timestamp}`);
                }

                const isoString = date.toISOString();
                console.log(`${fieldName} ISO string:`, isoString);
                return isoString;
            };

            console.log('🔍 Step 5d: Converting start date...');
            const startDate = safeDate(startTimestamp, 'current_period_start');
            console.log('✅ Step 5d: Start date converted:', startDate);

            console.log('🔍 Step 5e: Converting end date...');
            const endDate = safeDate(endTimestamp, 'current_period_end');
            console.log('✅ Step 5e: End date converted:', endDate);

            console.log('🔍 Step 5f: Building subscription data object...');
            subscriptionData = {
                account_id: accountId,
                stripe_subscription_id: subscription.id,
                subscription_status: subscription.status,
                plan_name: planName,
                current_period_start: startDate,
                current_period_end: endDate,
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString(),
                seats: getSeatsFromPlan(planName),
                price_per_seat: subscription.items.data[0]?.price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0,
                total_price: subscription.items.data[0]?.price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0,
                analysis_amount: getAnalysisAmountFromPlan(planName),
                analysis_used: 0,
            };

            console.log('✅ Step 5: Subscription data processed for plan:', planName);
            console.log('Final subscription data:', JSON.stringify(subscriptionData, null, 2));
        } catch (error) {
            console.error('❌ Step 5 failed - Data processing error:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
                subscription_id: subscription?.id,
                subscription_items: subscription?.items?.data
            });
            return NextResponse.json({ error: 'Failed to process subscription data', step: 5, details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
        }

        // Step 6: Update database
        try {
            console.log('🔍 Step 6a: Preparing subscription data for existing schema...');

            // Prepare data that matches the actual database schema
            const subscriptionUpdateData = {
                subscription_status: subscription.status,
                plan_name: subscriptionData.plan_name,
                current_period_start: subscriptionData.current_period_start,
                current_period_end: subscriptionData.current_period_end,
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString(),
                seats: subscriptionData.seats,
                price_per_seat: subscriptionData.price_per_seat,
                total_price: subscriptionData.total_price,
                analysis_amount: subscriptionData.analysis_amount,
                // Note: analysis_used is preserved from existing record
            };

            console.log('💾 Subscription update data:', subscriptionUpdateData);

            // Update existing subscription by account_id (not upsert by stripe_subscription_id)
            const { data: updateResult, error: updateError } = await supabase
                .from('subscriptions')
                .update(subscriptionUpdateData)
                .eq('account_id', accountId)
                .select();

            if (updateError) {
                console.error('❌ Subscription update error:', updateError);
                throw updateError;
            }

            console.log('✅ Step 6a: Subscription updated successfully:', updateResult);

            // ✅ REMOVED: No longer update accounts table - subscriptions table is single source of truth

            console.log('✅ Step 6: Database updated successfully');
        } catch (error) {
            console.error('❌ Step 6 failed - Database update error:', error);
            return NextResponse.json({ error: 'Failed to update database', step: 6, details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
        }

        // Step 7: Success response
        console.log('🎉 Sync completed successfully!');
        return NextResponse.json({
            success: true,
            message: 'Subscription synced successfully',
            subscription: {
                plan_name: subscriptionData.plan_name,
                status: subscription.status,
                stripe_subscription_id: subscription.id
            }
        });

    } catch (error) {
        console.error('❌ Unexpected error in sync process:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            accountId
        });

        // Ensure we always return a valid JSON response
        return NextResponse.json({
            error: 'Unexpected error occurred',
            message: error instanceof Error ? error.message : 'Unknown error',
            step: 'unexpected'
        }, { status: 500 });
    }
}

async function getPlanNameFromPriceId(priceId: string): Promise<string> {
    // Updated with your actual Stripe price IDs
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
        'Free': 5,
        'Solo': 10,
        'Entrepreneur': 30,
        'Team': 100,
    };

    return planLimits[planName] || 5;
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
