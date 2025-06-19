import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
});

export async function POST(request: NextRequest) {
    try {
        const { accountId, scheduleId } = await request.json();
        console.log('🗑️ Cancel scheduled change request:', { accountId, scheduleId });

        if (!accountId || !scheduleId) {
            console.log('❌ Missing parameters:', { accountId, scheduleId });
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get subscription data
        console.log('🔍 Fetching subscription data for account:', accountId);
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .single();

        if (subscriptionError || !subscription) {
            console.log('❌ Subscription lookup failed:', subscriptionError);
            return NextResponse.json({
                error: 'Subscription not found',
                message: `No subscription found with account ID: ${accountId}`
            }, { status: 404 });
        }

        console.log('✅ Subscription found:', {
            subscription_id: subscription.stripe_subscription_id,
            current_plan: subscription.plan_name,
            scheduled_plan: subscription.scheduled_plan_change,
            schedule_id: scheduleId
        });

        // Release the Stripe subscription schedule
        console.log('🗑️ Releasing Stripe subscription schedule:', scheduleId);
        await stripe.subscriptionSchedules.release(scheduleId);
        console.log('✅ Schedule released successfully');

        // Clear the scheduled change from the database
        const subscriptionData = {
            scheduled_plan_change: null,
            scheduled_change_date: null,
            stripe_schedule_id: null,
            updated_at: new Date().toISOString(),
        };

        console.log('💾 Clearing scheduled change from database...');
        const { data: updateResult, error: updateError } = await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('account_id', accountId)
            .select();

        if (updateError) {
            console.error('❌ Database update error:', updateError);
            return NextResponse.json({
                error: 'Database update failed',
                message: updateError.message
            }, { status: 500 });
        }

        console.log('✅ Database updated - scheduled change removed');

        return NextResponse.json({
            success: true,
            message: 'Scheduled change cancelled successfully',
            subscription: updateResult?.[0]
        });

    } catch (error) {
        console.error('❌ Cancel scheduled change error:', error);
        return NextResponse.json({
            error: 'Failed to cancel scheduled change',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
