import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
});

export async function POST(request: NextRequest) {
    try {
        const { subscriptionId, accountId } = await request.json();

        console.log('🔄 Reactivating subscription:', {
            subscriptionId,
            accountId,
        });

        if (!subscriptionId || !accountId) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Initialize Supabase client
        const supabase = await createClient();

        // Verify user authorization
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify account ownership
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .eq('owner_id', data.user.id)
            .single();

        if (accountError || !account) {
            return NextResponse.json(
                { success: false, error: 'Account not found or unauthorized' },
                { status: 404 }
            );
        }

        // Reactivate the subscription in Stripe by removing cancel_at_period_end
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
        });

        console.log('✅ Stripe subscription reactivated:', {
            id: subscription.id,
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: subscription.current_period_end,
        });

        // Update subscription in our database
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                subscription_status: subscription.status,
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString(),
            })
            .eq('account_id', accountId);

        if (updateError) {
            console.error('❌ Failed to update subscription in database:', updateError);
            // Don't fail the request if database update fails, Stripe is the source of truth
        } else {
            console.log('✅ Successfully updated subscription in database');
        }

        return NextResponse.json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                cancel_at_period_end: subscription.cancel_at_period_end,
                current_period_end: subscription.current_period_end,
            },
        });

    } catch (error: any) {
        console.error('❌ Reactivation error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to reactivate subscription',
            },
            { status: 500 }
        );
    }
}
