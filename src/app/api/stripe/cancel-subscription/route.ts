import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
});

export async function POST(request: NextRequest) {
    try {
        const { subscriptionId, accountId, cancelAtPeriodEnd, reason, feedback } = await request.json();

        console.log('🔵 Cancel API called with:', {
            subscriptionId,
            accountId,
            cancelAtPeriodEnd,
            reason,
            feedback
        });

        if (!subscriptionId || !accountId) {
            console.log('❌ Missing required parameters:', { subscriptionId, accountId });
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const supabase = await createClient();

        // Verify the subscription belongs to this account
        // Note: subscriptionId is the Stripe subscription ID, but our DB doesn't store it in subscriptions table
        // So we'll look up by account_id and verify the Stripe subscription ID matches what we expect
        console.log('🔍 Looking for subscription with accountId:', accountId);
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .single();

        console.log('🔍 Database query result:', { subscription, subscriptionError });

        if (subscriptionError || !subscription) {
            console.log('❌ Subscription not found:', { subscriptionError, subscription });
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Verify the Stripe subscription ID matches (for security)
        if (subscription.stripe_subscription_id !== subscriptionId) {
            console.log('❌ Stripe subscription ID mismatch:', {
                expected: subscriptionId,
                actual: subscription.stripe_subscription_id,
            });
            return NextResponse.json({ error: 'Subscription ID mismatch' }, { status: 403 });
        }

        // Cancel subscription in Stripe
        let stripeSubscription;
        if (cancelAtPeriodEnd) {
            // Cancel at period end (keep access until billing cycle ends)
            stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
                metadata: {
                    cancellation_reason: reason || 'no-reason-provided',
                    cancelled_at: new Date().toISOString(),
                }
            });
        } else {
            // Cancel immediately
            stripeSubscription = await stripe.subscriptions.cancel(subscriptionId, {
                prorate: false, // Don't issue credit for unused time
            });
        }

        // Update subscription in database
        const subscriptionUpdate = {
            subscription_status: cancelAtPeriodEnd ? 'active' : 'cancelled',
            cancel_at_period_end: Boolean(cancelAtPeriodEnd), // Explicitly convert to boolean
            updated_at: new Date().toISOString(),
        };

        console.log('🔍 cancelAtPeriodEnd value:', cancelAtPeriodEnd, 'type:', typeof cancelAtPeriodEnd);
        console.log('🔍 cancel_at_period_end will be set to:', Boolean(cancelAtPeriodEnd));

        console.log('🔄 Updating subscription in database:', subscriptionUpdate);
        const { data: updateResult, error: updateError } = await supabase
            .from('subscriptions')
            .update(subscriptionUpdate)
            .eq('account_id', accountId)
            .select(); // Return the updated data

        if (updateError) {
            console.error('❌ Database update error:', updateError);
            // Don't fail the request - webhook will handle it
        } else {
            console.log('✅ Database update successful:', updateResult);
        }

        // Log cancellation reason for business insights
        if (reason || feedback) {
            const { error: logError } = await supabase
                .from('cancellation_feedback')
                .insert({
                    account_id: accountId,
                    subscription_id: subscriptionId,
                    plan_name: subscription.plan_name,
                    reason: reason || null,
                    feedback: feedback || null,
                    cancel_at_period_end: cancelAtPeriodEnd,
                    cancelled_at: new Date().toISOString(),
                });

            if (logError) {
                console.error('Could not log cancellation feedback:', logError);
                // Don't fail the request for logging errors
            }
        }

        // Update subscription to Free plan if cancelled immediately
        if (!cancelAtPeriodEnd) {
            await supabase
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
                .eq('account_id', accountId);
        }

        return NextResponse.json({
            success: true,
            message: cancelAtPeriodEnd
                ? 'Subscription will be cancelled at the end of your billing period'
                : 'Subscription cancelled immediately',
            subscription: {
                id: stripeSubscription.id,
                status: stripeSubscription.status,
                cancel_at_period_end: stripeSubscription.cancel_at_period_end,
                current_period_end: stripeSubscription.current_period_end
            }
        });

    } catch (error) {
        console.error('Subscription cancellation error:', error);
        return NextResponse.json({
            error: 'Failed to cancel subscription',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
