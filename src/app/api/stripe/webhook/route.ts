import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log(`🎯 Webhook received: ${event.type}`);
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createClient();

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

    // Get account by Stripe customer ID
    const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (accountError || !account) {
        console.error('❌ Account not found for customer:', customerId);
        return;
    }

    console.log(`✅ Found account: ${account.id} for customer: ${customerId}`);

    // Get price details to determine plan
    const priceId = subscription.items.data[0]?.price.id;
    console.log(`🔍 Processing price ID: ${priceId}`);
    const planName = await getPlanNameFromPriceId(priceId);
    console.log(`📋 Mapped to plan: ${planName} with ${getSeatsFromPlan(planName)} seats`);

    // Update or create subscription record
    const subscriptionData = {
        account_id: account.id,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
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
    };

    // For subscription upgrades, we want to update the existing subscription for this account
    // rather than creating a new one. First try to update existing subscription by account_id.
    const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('account_id', account.id)
        .single();

    if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('account_id', account.id);

        if (updateError) {
            console.error('Error updating existing subscription:', updateError);
        } else {
            console.log('✅ Updated existing subscription for account:', account.id);
        }
    } else {
        // Create new subscription if none exists
        const { error: insertError } = await supabase
            .from('subscriptions')
            .insert(subscriptionData);

        if (insertError) {
            console.error('Error creating new subscription:', insertError);
        } else {
            console.log('✅ Created new subscription for account:', account.id);
        }
    }

    // Update account
    await supabase
        .from('accounts')
        .update({
            plan: planName,
            stripe_subscription_id: subscription.id,
            susbscription_status: subscription.status,
            subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
    const customerId = subscription.customer as string;

    const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (accountError || !account) {
        console.error('Account not found for customer:', customerId);
        return;
    }

    // Update subscription status
    await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

    // Revert account to free plan
    await supabase
        .from('accounts')
        .update({
            plan: 'Free',
            stripe_subscription_id: null,
            susbscription_status: 'active',
            subscription_ends_at: null,
            emails_left: 100, // Reset to free plan limit
            updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
    // Reset usage counters on successful payment
    const subscriptionId = invoice.subscription as string;

    if (subscriptionId) {
        await supabase
            .from('subscriptions')
            .update({
                analysis_used: 0, // Reset usage counter
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
    }

    console.log('Payment succeeded for invoice:', invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
    // Handle failed payments - you might want to notify users or update status
    console.log('Payment failed for invoice:', invoice.id);

    const subscriptionId = invoice.subscription as string;
    if (subscriptionId) {
        // You could update subscription status or send notifications here
        console.log('Subscription with failed payment:', subscriptionId);
    }
}

async function getPlanNameFromPriceId(priceId: string): Promise<string> {
    // Map price IDs to plan names - Updated with your actual Stripe price IDs
    const priceToplanMap: Record<string, string> = {
        'price_1RZ9HkCsZBRpsVkXiDJ1KICM': 'Team', // Team YEARLY
        'price_1RZ9HkCsZBRpsVkXBQNNjw87': 'Team', // Team MONTHLY
        'price_1RZ9EoCsZBRpsVkXVniKqUeU': 'Entrepreneur', // Entrepreneur YEARLY
        'price_1RZ9EoCsZBRpsVkXxzMu3paC': 'Entrepreneur', // Entrepreneur MONTHLY
        'price_1RZ9CfCsZBRpsVkXUefPaqVu': 'Solo', // Solo YEARLY
        'price_1RZ9CfCsZBRpsVkXt0nTDOee': 'Solo', // Solo MONTHLY
    };

    console.log(`🔍 Webhook: Looking up price ID: ${priceId}`);
    console.log(`📋 Available price mappings:`, Object.keys(priceToplanMap));

    const planName = priceToplanMap[priceId] || 'Free';
    console.log(`✅ Mapped to plan: ${planName}`);

    if (planName === 'Free') {
        console.warn(`⚠️  Price ID ${priceId} not found in mapping! Add it to webhook handler.`);
    }

    return planName;
}

function getAnalysisAmountFromPlan(planName: string): number {
    const planLimits: Record<string, number> = {
        'Free': 100,
        'Solo': 1000,
        'Entrepreneur': 5000,
        'Team': 20000,
    };

    return planLimits[planName] || 100;
}

function getSeatsFromPlan(planName: string): number {
    const planSeats: Record<string, number> = {
        'Free': 1,
        'Solo': 1,
        'Entrepreneur': 5,
        'Team': 20,
    };

    return planSeats[planName] || 1;
}
