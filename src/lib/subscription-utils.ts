import { createClient } from '@/utils/supabase/server';

/**
 * Get the current active subscription for an account
 * Uses only the subscriptions table as the single source of truth
 */
export async function getCurrentActiveSubscription(account_id: string) {
  const supabase = await createClient();

  try {
    // Get the most recent subscription for this account
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('account_id', account_id)
      .order('created_at', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return { subscription: null, error: error.message };
    }

    if (!subscription) {
      return {
        subscription: null,
        error: 'No subscription found for this account'
      };
    }

    // Check if this subscription is still valid/active
    const isActive = subscription.subscription_status === 'active' ||
                    (subscription.subscription_status === 'cancelled' &&
                     subscription.cancel_at_period_end &&
                     subscription.current_period_end &&
                     new Date(subscription.current_period_end) > new Date());

    return {
      subscription,
      error: null,
      isActive,
      isExpired: !isActive && subscription.subscription_status !== 'active'
    };

  } catch (error: any) {
    console.error('Unexpected error in getCurrentActiveSubscription:', error);
    return {
      subscription: null,
      error: error.message || 'Unexpected error occurred'
    };
  }
}

/**
 * Get all subscriptions for an account (active and inactive)
 * Useful for subscription management pages
 */
export async function getAllSubscriptions(account_id: string) {
  const supabase = await createClient();

  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('account_id', account_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all subscriptions:', error);
      return { subscriptions: [], error: error.message };
    }

    const activeSubscriptions = subscriptions?.filter(sub => {
      if (sub.subscription_status === 'active') return true;
      if (sub.subscription_status === 'cancelled' && sub.cancel_at_period_end && sub.current_period_end) {
        return new Date(sub.current_period_end) > new Date();
      }
      return false;
    }) || [];

    const inactiveSubscriptions = subscriptions?.filter(sub => !activeSubscriptions.includes(sub)) || [];

    return {
      subscriptions: subscriptions || [],
      activeSubscriptions,
      inactiveSubscriptions,
      error: null
    };

  } catch (error: any) {
    console.error('Unexpected error in getAllSubscriptions:', error);
    return {
      subscriptions: [],
      error: error.message || 'Unexpected error occurred'
    };
  }
}

/**
 * Check if an account has access to premium features
 * Based purely on subscription data
 */
export async function hasActiveSubscription(account_id: string): Promise<boolean> {
  const result = await getCurrentActiveSubscription(account_id);
  return result.isActive || false;
}

/**
 * Get subscription plan info for an account
 * Returns plan details from subscription table only
 */
export async function getAccountPlanInfo(account_id: string) {
  const result = await getCurrentActiveSubscription(account_id);

  if (!result.subscription) {
    return {
      planName: 'Free',
      status: 'active',
      seats: 1,
      analysisAmount: 100,
      analysisUsed: 0,
      emailsLeft: 100,
      isActive: true,
      error: result.error
    };
  }

  const sub = result.subscription;

  return {
    planName: sub.plan_name || 'Free',
    status: sub.subscription_status,
    seats: sub.seats || 1,
    analysisAmount: sub.analysis_amount || 100,
    analysisUsed: sub.analysis_used || 0,
    emailsLeft: sub.emails_left || 100,
    pricePerSeat: sub.price_per_seat || 0,
    totalPrice: sub.total_price || 0,
    currentPeriodStart: sub.current_period_start,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    stripeSubscriptionId: sub.stripe_subscription_id,
    stripeCustomerId: sub.stripe_customer_id,
    isActive: result.isActive,
    isExpired: result.isExpired,
    error: null
  };
}

/**
 * Refresh subscription data after upgrade/downgrade
 * Useful to call after subscription changes
 */
export async function refreshSubscriptionCache(account_id: string) {
  // This function can be expanded to include caching logic if needed
  return await getCurrentActiveSubscription(account_id);
}
