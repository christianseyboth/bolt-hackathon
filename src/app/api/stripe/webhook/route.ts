import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
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
                await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabase);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
                break;

            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
                break;

            default:
                // Unhandled event type
        }
    } catch (error) {
        console.error('❗ Error handling webhook:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any) {
    const customerId = subscription.customer as string;
    console.log(`🔄 Processing subscription update for customer: ${customerId}, subscription: ${subscription.id}`);

    // First, try to find subscription by existing customer ID
    let { data: existingSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('account_id')
        .eq('stripe_customer_id', customerId)
        .single();

    let accountId = existingSubscription?.account_id;

    // If not found, this might be a new customer from checkout
    // Try to find subscription with NULL customer ID and match by account email
    if (subscriptionError || !existingSubscription) {
        console.log('🔍 Subscription not found by customer ID, checking for new customer from checkout...');

        // Get customer email from Stripe
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = (customer as any).email;

        if (customerEmail) {
            console.log(`🔍 Looking for account with email: ${customerEmail}`);

            // Find account by email
            const { data: account, error: accountError } = await supabase
                .from('accounts')
                .select('id')
                .eq('billing_email', customerEmail)
                .single();

            if (account && !accountError) {
                // Find subscription with NULL customer ID for this account
                const { data: nullCustomerSub, error: nullCustomerError } = await supabase
                    .from('subscriptions')
                    .select('account_id')
                    .eq('account_id', account.id)
                    .is('stripe_customer_id', null)
                    .single();

                if (nullCustomerSub && !nullCustomerError) {
                    console.log(`✅ Found subscription with NULL customer ID for account: ${account.id}`);
                    accountId = account.id;
                    existingSubscription = nullCustomerSub;
                }
            }
        }
    }

    if (!accountId || !existingSubscription) {
        console.error('❌ Could not find subscription for customer:', customerId);
        return;
    }

    console.log(`✅ Found account: ${accountId} for customer: ${customerId}`);

    // Get price details to determine plan
    const priceId = subscription.items.data[0]?.price.id;
    console.log(`🔍 Processing price ID: ${priceId}`);
    const planName = await getPlanNameFromPriceId(priceId);
    console.log(`📋 Mapped to plan: ${planName} with ${getSeatsFromPlan(planName)} seats`);

    // Get current subscription to check if this is an upgrade from Free
    const { data: currentSub } = await supabase
        .from('subscriptions')
        .select('plan_name, analysis_used, emails_left')
        .eq('account_id', accountId)
        .single();

    const currentAnalysisAmount = getAnalysisAmountFromPlan(currentSub?.plan_name || 'Free');
    const newAnalysisAmount = getAnalysisAmountFromPlan(planName);
    const isUpgradeFromFree = currentSub?.plan_name === 'Free' && planName !== 'Free';
    const isPaidToPaidUpgrade = currentSub?.plan_name !== 'Free' && planName !== 'Free' && newAnalysisAmount > currentAnalysisAmount;

    // Reset usage for Free upgrades, new subscriptions, and paid-to-paid upgrades
    const shouldResetUsage = isUpgradeFromFree || isPaidToPaidUpgrade;

    console.log(`🔄 Webhook usage reset logic:`, {
        currentPlan: currentSub?.plan_name || 'Unknown',
        newPlan: planName,
        currentAnalysisAmount,
        newAnalysisAmount,
        isUpgradeFromFree,
        isPaidToPaidUpgrade,
        shouldResetUsage,
        resetReason: shouldResetUsage ?
            (isUpgradeFromFree ? 'Free upgrade' :
             isPaidToPaidUpgrade ? 'Paid-to-paid upgrade' : 'Unknown') : 'No reset needed'
    });

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
        analysis_amount: newAnalysisAmount,
        // Reset usage for Free upgrades and paid-to-paid upgrades, otherwise preserve current usage
        analysis_used: shouldResetUsage ? 0 : (currentSub?.analysis_used || 0),
        emails_left: shouldResetUsage ? newAnalysisAmount : (currentSub?.emails_left || newAnalysisAmount),
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

    // Try to find subscription by customer ID first
    let { data: existingSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('account_id')
        .eq('stripe_customer_id', customerId)
        .single();

    let accountId = existingSubscription?.account_id;

    // If not found, try the same fallback logic as in handleSubscriptionUpdate
    if (subscriptionError || !existingSubscription) {
        console.log('🔍 Subscription not found by customer ID for deletion, checking by email...');

        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = (customer as any).email;

        if (customerEmail) {
            const { data: account, error: accountError } = await supabase
                .from('accounts')
                .select('id')
                .eq('billing_email', customerEmail)
                .single();

            if (account && !accountError) {
                const { data: nullCustomerSub, error: nullCustomerError } = await supabase
                    .from('subscriptions')
                    .select('account_id')
                    .eq('account_id', account.id)
                    .is('stripe_customer_id', null)
                    .single();

                if (nullCustomerSub && !nullCustomerError) {
                    accountId = account.id;
                    existingSubscription = nullCustomerSub;
                }
            }
        }
    }

    if (!accountId || !existingSubscription) {
        console.error('❌ Could not find subscription for customer deletion:', customerId);
        return;
    }
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
            analysis_amount: 5, // Free plan gets 5 analyses
            analysis_used: 0, // Reset usage counter
            current_period_start: new Date().toISOString(),
            current_period_end: null,
            stripe_subscription_id: null, // Clear the Stripe subscription ID
            emails_left: 5, // Free plan gets 5 emails
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
    // Reset usage counters on successful payment (subscription renewal)
    const subscriptionId = invoice.subscription as string;
    const customerId = invoice.customer as string;

    console.log(`💰 Processing payment success for customer: ${customerId}, subscription: ${subscriptionId}`);

    if (subscriptionId && customerId) {
        // Get current subscription data to show what we're resetting
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('account_id, plan_name, analysis_used, emails_left, analysis_amount')
            .eq('stripe_customer_id', customerId)
            .single();

        if (subscription && !subError) {
            const planName = subscription.plan_name;
            const newAnalysisAmount = getAnalysisAmountFromPlan(planName);
            const unusedAnalyses = subscription.emails_left || 0;

            console.log(`🔄 Subscription renewal for ${planName} plan:`, {
                accountId: subscription.account_id,
                previousPeriod: {
                    analysisUsed: subscription.analysis_used || 0,
                    emailsLeft: unusedAnalyses,
                    totalAllowed: subscription.analysis_amount || newAnalysisAmount
                },
                newPeriod: {
                    analysisUsed: 0,
                    emailsLeft: newAnalysisAmount,
                    totalAllowed: newAnalysisAmount
                },
                unusedFromPreviousPeriod: unusedAnalyses,
                renewalPolicy: 'Reset to full plan allowance (standard SaaS behavior)'
            });

            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                    analysis_used: 0, // Reset usage counter to 0 (fresh start)
                    emails_left: newAnalysisAmount, // Reset emails left to full plan limit
                    updated_at: new Date().toISOString(),
                })
                .eq('account_id', subscription.account_id);

            if (updateError) {
                console.error('❌ Failed to reset usage counters:', updateError);
            } else {
                console.log(`✅ Subscription renewed for account: ${subscription.account_id}`);
                if (unusedAnalyses > 0) {
                    console.log(`ℹ️  Note: ${unusedAnalyses} unused analyses from previous period were reset (standard renewal behavior)`);
                }
            }
        } else {
            console.error('❌ Could not find subscription for customer:', customerId, subError);
        }
    }

    console.log('✅ Payment succeeded for invoice:', invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
    // Handle failed payment
    console.log('Payment failed for invoice:', invoice.id);
}

// Helper functions for plan mapping
async function getPlanNameFromPriceId(priceId: string): Promise<string> {
    const priceToPlans: Record<string, string> = {
        // ✅ LIVE PRICE IDs - Updated with actual live price IDs

        // Solo plan
        'price_1RauH4CsZBRpsVkXOXdBujCQ': 'Solo', // Solo Monthly (LIVE)
        'price_1RauH4CsZBRpsVkXa0dT3xwB': 'Solo', // Solo Yearly (LIVE)

        // Entrepreneur plan
        'price_1RauH0CsZBRpsVkXHz5yaTaZ': 'Entrepreneur', // Entrepreneur Monthly (LIVE)
        'price_1RauH0CsZBRpsVkXnwphSPYL': 'Entrepreneur', // Entrepreneur Yearly (LIVE)

        // Team plan
        'price_1RauGuCsZBRpsVkXItMdS7b8': 'Team', // Team Monthly (LIVE)
        'price_1RauGuCsZBRpsVkXqyMwPuFO': 'Team', // Team Yearly (LIVE)

        // Keep old test IDs for fallback during transition (remove after fully migrated)
        'price_1RZ9HkCsZBRpsVkXiDJ1KICM': 'Team', // Team YEARLY (TEST)
        'price_1RZ9HkCsZBRpsVkXBQNNjw87': 'Team', // Team MONTHLY (TEST)
        'price_1RZ9EoCsZBRpsVkXVniKqUeU': 'Entrepreneur', // Entrepreneur YEARLY (TEST)
        'price_1RZ9EoCsZBRpsVkXxzMu3paC': 'Entrepreneur', // Entrepreneur MONTHLY (TEST)
        'price_1RZ9CfCsZBRpsVkXUefPaqVu': 'Solo', // Solo YEARLY (TEST)
        'price_1RZ9CfCsZBRpsVkXt0nTDOee': 'Solo', // Solo MONTHLY (TEST)
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
        'Free': 5,
        'Solo': 10,
        'Entrepreneur': 30,
        'Team': 100,
    };
    return planAnalysis[planName] || 5;
}
