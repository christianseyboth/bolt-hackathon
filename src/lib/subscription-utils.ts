import { createClient } from '@/utils/supabase/server';

/**
 * Get the current active subscription for an account
 * Handles cases where users might have multiple subscriptions
 * Returns the most recent active subscription
 */
export async function getCurrentActiveSubscription(account_id: string) {
  const supabase = await createClient();

  try {
    // First try to get active subscriptions
    const { data: activeSubscriptions, error: activeError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('account_id', account_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }) // Most recent first
      .order('updated_at', { ascending: false }); // In case created_at is same, use updated_at

    if (activeError) {
      console.error('Error fetching active subscriptions:', activeError);
    }

    // If we have active subscriptions, use those
    if (activeSubscriptions && activeSubscriptions.length > 0) {
      return {
        subscription: activeSubscriptions[0],
        error: null,
        totalActiveSubscriptions: activeSubscriptions.length
      };
    }

    // If no active subscriptions, get the most recent subscription regardless of status
    // This handles cases where user manually changed subscription status
    console.log('No active subscriptions found, fetching most recent subscription...');
    const { data: allSubscriptions, error: allError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('account_id', account_id)
      .order('created_at', { ascending: false })
      .order('updated_at', { ascending: false });

    if (allError) {
      console.error('Error fetching all subscriptions:', allError);
      return { subscription: null, error: allError.message };
    }

    if (!allSubscriptions || allSubscriptions.length === 0) {
      return {
        subscription: null,
        error: 'No subscriptions found for this account'
      };
    }

    // Return the most recent subscription (regardless of status)
    console.log(`Using most recent subscription with status: ${allSubscriptions[0].status}`);
    return {
      subscription: allSubscriptions[0],
      error: null,
      totalActiveSubscriptions: 0,
      usingMostRecent: true
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

    const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active') || [];
    const inactiveSubscriptions = subscriptions?.filter(sub => sub.status !== 'active') || [];

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
 * Refresh subscription data after upgrade/downgrade
 * Useful to call after subscription changes
 */
export async function refreshSubscriptionCache(account_id: string) {
  // This function can be expanded to include caching logic if needed
  return await getCurrentActiveSubscription(account_id);
}
