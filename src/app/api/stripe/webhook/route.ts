import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        const body = await request.text();
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                console.log(`📝 Processing subscription event: ${event.type}`);
                await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabase);
                break;

            case 'customer.subscription.deleted':
                console.log(`🗑️ Processing subscription deletion`);
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
                break;

            case 'invoice.payment_succeeded':
                console.log(`💰 Processing successful payment`);
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
                break;

            case 'invoice.payment_failed':
                console.log(`❌ Processing failed payment`);
                await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
                break;

            default:
                console.log(`❓ Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error('❗ Error handling webhook:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }

    console.log(`✅ Webhook processed successfully: ${event.type}`);
    return NextResponse.json({ received: true });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any) {
    const customerId = subscription.customer as string;
    console.log(`🔄 Processing subscription update for customer: ${customerId}, subscription: ${subscription.id}`);

    // Get account by Stripe customer ID from subscriptions table
    const { data: existingSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('account_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (subscriptionError || !existingSubscription) {
        console.error('❌ Subscription not found for customer:', customerId);
        return;
    }

    const accountId = existingSubscription.account_id;

    console.log(`✅ Found account: ${accountId} for customer: ${customerId}`);

    // Get price details to determine plan
    const priceId = subscription.items.data[0]?.price.id;
    console.log(`🔍 Processing price ID: ${priceId}`);
    const planName = await getPlanNameFromPriceId(priceId);
    console.log(`📋 Mapped to plan: ${planName} with ${getSeatsFromPlan(planName)} seats`);

    // Update or create subscription record
    const subscriptionData = {
        account_id: accountId,
        subscription_status: subscription.status,
        plan_name: planName,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
        seats: getSeatsFromPlan(planName),
        price_per_seat: subscription.items.data[0]?.price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0,
        total_price: subscription.items.data[0]?.price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0,
        analysis_amount: getAnalysisAmountFromPlan(planName),
        analysis_used: 0,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
    };

    // Update existing subscription (we already found it exists since we got the accountId from it)
    const { error: updateError } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('account_id', accountId);

    if (updateError) {
        console.error('Error updating existing subscription:', updateError);
    } else {
        console.log('✅ Updated existing subscription for account:', accountId);
    }

    // ✅ REMOVED: No longer update accounts table - subscriptions table is single source of truth
    console.log('✅ Subscription data updated in subscriptions table only');
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
    const customerId = subscription.customer as string;
    console.log(`🗑️ Processing subscription deletion for customer: ${customerId}, subscription: ${subscription.id}`);

    const { data: existingSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('account_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (subscriptionError || !existingSubscription) {
        console.error('❌ Subscription not found for customer:', customerId);
        return;
    }

    const accountId = existingSubscription.account_id;
    console.log(`✅ Found account: ${accountId} for deleted subscription`);

    // Update subscription to Free plan (not just "canceled")
    const { error: updateError } = await supabase
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
            stripe_subscription_id: null, // Clear the Stripe subscription ID
            emails_left: 100,
            updated_at: new Date().toISOString(),
        })
        .eq('account_id', accountId);

    if (updateError) {
        console.error('❌ Error updating subscription to Free plan:', updateError);
    } else {
        console.log('✅ Updated subscription to Free plan for account:', accountId);
    }

    // ✅ REMOVED: No longer update accounts table - subscriptions table is single source of truth
    console.log('✅ Subscription deletion handled in subscriptions table only');
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
    // Reset usage counters on successful payment
    const subscriptionId = invoice.subscription as string;
    const customerId = invoice.customer as string;

    if (subscriptionId && customerId) {
        // Get account by customer ID from subscriptions table
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('account_id')
            .eq('stripe_customer_id', customerId)
            .single();

        if (subscription) {
            await supabase
                .from('subscriptions')
                .update({
                    analysis_used: 0, // Reset usage counter
                    updated_at: new Date().toISOString(),
                })
                .eq('account_id', subscription.account_id);
        }
    }

    console.log('Payment succeeded for invoice:', invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
    // Handle failed payment
    console.log('Payment failed for invoice:', invoice.id);
}

// Helper functions for plan mapping
async function getPlanNameFromPriceId(priceId: string): Promise<string> {
    const priceToPlans: Record<string, string> = {
        // Current price IDs
        'price_1RZ9HkCsZBRpsVkXiDJ1KICM': 'Team', // Team YEARLY
        'price_1RZ9HkCsZBRpsVkXBQNNjw87': 'Team', // Team MONTHLY
        'price_1RZ9EoCsZBRpsVkXVniKqUeU': 'Entrepreneur', // Entrepreneur YEARLY
        'price_1RZ9EoCsZBRpsVkXxzMu3paC': 'Entrepreneur', // Entrepreneur MONTHLY
        'price_1RZ9CfCsZBRpsVkXUefPaqVu': 'Solo', // Solo YEARLY
        'price_1RZ9CfCsZBRpsVkXt0nTDOee': 'Solo', // Solo MONTHLY
    };

    return priceToPlans[priceId] || 'Free';
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

function getAnalysisAmountFromPlan(planName: string): number {
    const planAnalysis: Record<string, number> = {
        'Free': 100,
        'Solo': 500,
        'Entrepreneur': 2000,
        'Team': 5000,
    };
    return planAnalysis[planName] || 100;
}
