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

        console.log('🔍 Testing cancel sync for accountId:', accountId);

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
            cancel_at_period_end: subscription.cancel_at_period_end,
            stripe_subscription_id: subscription.stripe_subscription_id,
            current_period_end: subscription.current_period_end
        });

        // Test updating to cancelled status
        const { data: updateResult, error: updateError } = await supabase
            .from('subscriptions')
            .update({
                subscription_status: 'cancelled',
                plan_name: 'Free',
                cancel_at_period_end: false,
                stripe_subscription_id: null,
                emails_left: 100,
                updated_at: new Date().toISOString()
            })
            .eq('account_id', accountId)
            .select();

        if (updateError) {
            return NextResponse.json({
                error: 'Failed to update subscription',
                details: updateError.message
            }, { status: 500 });
        }

        console.log('✅ Successfully updated subscription to cancelled/Free');

        return NextResponse.json({
            success: true,
            message: 'Subscription updated to cancelled/Free plan',
            before: {
                plan_name: subscription.plan_name,
                subscription_status: subscription.subscription_status,
                cancel_at_period_end: subscription.cancel_at_period_end
            },
            after: updateResult?.[0] || null
        });

    } catch (error) {
        console.error('Test cancel sync error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
