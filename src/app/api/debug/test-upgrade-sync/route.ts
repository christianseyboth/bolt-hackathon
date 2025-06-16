import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get the account ID from URL params
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get('accountId');

        if (!accountId) {
            return NextResponse.json({ error: 'accountId parameter required' }, { status: 400 });
        }

        console.log('🔍 Testing upgrade sync for accountId:', accountId);

        // Get current subscription
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .single();

        if (error || !subscription) {
            return NextResponse.json({
                error: 'Subscription not found',
                details: error?.message
            }, { status: 404 });
        }

        console.log('📋 Current subscription state:', {
            id: subscription.id,
            plan_name: subscription.plan_name,
            subscription_status: subscription.subscription_status,
            seats: subscription.seats,
            price_per_seat: subscription.price_per_seat,
            total_price: subscription.total_price,
            analysis_amount: subscription.analysis_amount,
            stripe_subscription_id: subscription.stripe_subscription_id,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            updated_at: subscription.updated_at
        });

        return NextResponse.json({
            success: true,
            subscription: {
                plan_name: subscription.plan_name,
                subscription_status: subscription.subscription_status,
                seats: subscription.seats,
                price_per_seat: subscription.price_per_seat,
                total_price: subscription.total_price,
                analysis_amount: subscription.analysis_amount,
                stripe_subscription_id: subscription.stripe_subscription_id,
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end,
                updated_at: subscription.updated_at
            },
            analysis: {
                lastUpdated: subscription.updated_at,
                timeSinceUpdate: subscription.updated_at ?
                    Math.round((Date.now() - new Date(subscription.updated_at).getTime()) / 1000) + ' seconds ago' :
                    'Never',
                expectedFeatures: {
                    seats: subscription.seats,
                    analysisAmount: subscription.analysis_amount,
                    planTier: subscription.plan_name
                }
            }
        });

    } catch (error) {
        console.error('Test upgrade sync error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
