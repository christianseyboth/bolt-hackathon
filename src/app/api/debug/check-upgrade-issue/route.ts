import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get the account ID from URL params
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get('accountId');

        if (!accountId) {
            return NextResponse.json({ error: 'accountId parameter required' }, { status: 400 });
        }

        console.log('🔍 Debugging upgrade issue for accountId:', accountId);

        // Get current subscription from database
        const { data: dbSubscription, error: dbError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .single();

        if (dbError || !dbSubscription) {
            return NextResponse.json({
                error: 'Database subscription not found',
                details: dbError?.message,
                accountId
            }, { status: 404 });
        }

        console.log('📋 Database subscription:', {
            id: dbSubscription.id,
            plan_name: dbSubscription.plan_name,
            stripe_subscription_id: dbSubscription.stripe_subscription_id,
            stripe_customer_id: dbSubscription.stripe_customer_id,
            updated_at: dbSubscription.updated_at
        });

        // Get all Stripe subscriptions for this customer
        if (!dbSubscription.stripe_customer_id) {
            return NextResponse.json({
                error: 'No Stripe customer ID in database',
                dbSubscription: dbSubscription
            }, { status: 400 });
        }

        const allSubscriptions = await stripe.subscriptions.list({
            customer: dbSubscription.stripe_customer_id,
            limit: 10,
        });

        const activeSubscriptions = allSubscriptions.data.filter(sub => sub.status === 'active');
        const cancelledSubscriptions = allSubscriptions.data.filter(sub => sub.status === 'canceled');

        console.log('📋 Stripe subscriptions:', {
            total: allSubscriptions.data.length,
            active: activeSubscriptions.length,
            cancelled: cancelledSubscriptions.length,
            allStatuses: allSubscriptions.data.map(sub => ({ id: sub.id, status: sub.status }))
        });

        return NextResponse.json({
            success: true,
            accountId,
            database: {
                subscription_id: dbSubscription.id,
                plan_name: dbSubscription.plan_name,
                stripe_subscription_id: dbSubscription.stripe_subscription_id,
                stripe_customer_id: dbSubscription.stripe_customer_id,
                subscription_status: dbSubscription.subscription_status,
                updated_at: dbSubscription.updated_at
            },
            stripe: {
                customer_id: dbSubscription.stripe_customer_id,
                total_subscriptions: allSubscriptions.data.length,
                active_subscriptions: activeSubscriptions.map(sub => ({
                    id: sub.id,
                    status: sub.status,
                    plan: sub.items.data[0]?.price.nickname || sub.items.data[0]?.price.id,
                    created: new Date(sub.created * 1000).toISOString()
                })),
                cancelled_subscriptions: cancelledSubscriptions.map(sub => ({
                    id: sub.id,
                    status: sub.status,
                    plan: sub.items.data[0]?.price.nickname || sub.items.data[0]?.price.id,
                    created: new Date(sub.created * 1000).toISOString(),
                    ended: sub.ended_at ? new Date(sub.ended_at * 1000).toISOString() : null
                }))
            },
            analysis: {
                db_points_to_stripe_id: dbSubscription.stripe_subscription_id,
                active_stripe_ids: activeSubscriptions.map(sub => sub.id),
                is_db_pointing_to_active_sub: activeSubscriptions.some(sub => sub.id === dbSubscription.stripe_subscription_id),
                problem: activeSubscriptions.length > 1 ? 'Multiple active subscriptions in Stripe' :
                        !activeSubscriptions.some(sub => sub.id === dbSubscription.stripe_subscription_id) ? 'Database points to wrong subscription' :
                        'No obvious problem detected'
            }
        });

    } catch (error) {
        console.error('Debug upgrade issue error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
