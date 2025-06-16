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

        console.log('🔍 Checking subscription status for accountId:', accountId);

        // Get current subscription
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .single();

        if (error) {
            return NextResponse.json({
                error: 'Error fetching subscription',
                details: error.message
            }, { status: 500 });
        }

        if (!subscription) {
            return NextResponse.json({
                error: 'No subscription found'
            }, { status: 404 });
        }

        // Check cancel status
        const now = new Date();
        const endDate = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
        const isStillActive = endDate ? endDate > now : false;

        console.log('📋 Current subscription status:', {
            plan_name: subscription.plan_name,
            subscription_status: subscription.subscription_status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: subscription.current_period_end,
            stripe_subscription_id: subscription.stripe_subscription_id,
            isStillActive,
            daysUntilEnd: endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
        });

        return NextResponse.json({
            success: true,
            subscription: {
                plan_name: subscription.plan_name,
                subscription_status: subscription.subscription_status,
                cancel_at_period_end: subscription.cancel_at_period_end,
                current_period_end: subscription.current_period_end,
                stripe_subscription_id: subscription.stripe_subscription_id,
                emails_left: subscription.emails_left,
                updated_at: subscription.updated_at
            },
            analysis: {
                isStillActive,
                daysUntilEnd: endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null,
                expectedUIState: subscription.cancel_at_period_end && isStillActive
                    ? 'Active (Ending Soon)'
                    : subscription.cancel_at_period_end && !isStillActive
                    ? 'Expired'
                    : 'Active',
                expectedButton: subscription.cancel_at_period_end && isStillActive
                    ? 'Reactivate Subscription'
                    : subscription.cancel_at_period_end && !isStillActive
                    ? 'Choose New Plan'
                    : 'Cancel Subscription'
            }
        });

    } catch (error) {
        console.error('Check cancel status error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
