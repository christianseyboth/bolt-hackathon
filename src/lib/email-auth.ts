import { createClient } from '@/utils/supabase/server';

/**
 * Check if an email address is authorized to send emails for analysis
 * This function enforces subscription limits and member status
 */
export async function isEmailAuthorized(email: string, subscription_id?: string) {
  const supabase = await createClient();

  try {
    // If no subscription_id provided, try to find it from the email
    let targetSubscriptionId = subscription_id;

    if (!targetSubscriptionId) {
      const { data: member } = await supabase
        .from('authorized_addresses')
        .select('subscription_id')
        .eq('email', email)
        .single();

      if (!member) {
        return {
          authorized: false,
          reason: 'Email not found in any authorized addresses',
          shouldBlock: true
        };
      }

      targetSubscriptionId = member.subscription_id;
    }

    // Get the member record
    const { data: member, error } = await supabase
      .from('authorized_addresses')
      .select('id, email, status, created_at')
      .eq('subscription_id', targetSubscriptionId)
      .eq('email', email)
      .single();

    if (error || !member) {
      return {
        authorized: false,
        reason: 'Email not found in authorized addresses',
        shouldBlock: true
      };
    }

            // Check if member is active
    if (member.status !== 'active') {
      return {
        authorized: false,
        reason: member.status === 'inactive'
          ? 'Email address disabled due to subscription limits'
          : `Email address status: ${member.status}`,
        shouldBlock: true,
        memberStatus: member.status
      };
    }

    // Get subscription details for limit verification
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('seats')
      .eq('id', targetSubscriptionId)
      .single();

    if (subError) {
      return {
        authorized: false,
        reason: 'Unable to verify subscription',
        shouldBlock: false // Don't block due to system error
      };
    }

    // Count all active members in order of creation (oldest first)
    const { data: activeMembers, error: countError } = await supabase
      .from('authorized_addresses')
      .select('id, created_at')
      .eq('subscription_id', targetSubscriptionId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (countError) {
      return {
        authorized: false,
        reason: 'Unable to verify member count',
        shouldBlock: false // Don't block due to system error
      };
    }

    const maxMembers = subscription.seats;
    const memberIndex = activeMembers?.findIndex(m => m.id === member.id) ?? -1;

    // Check if this member is within the allowed limit (oldest members get priority)
    if (memberIndex >= 0 && memberIndex < maxMembers) {
      return {
        authorized: true,
        reason: 'Email authorized and within subscription limits',
        shouldBlock: false,
        memberIndex: memberIndex + 1,
        totalActiveMembers: activeMembers?.length || 0,
        subscriptionLimit: maxMembers
      };
    }

    return {
      authorized: false,
      reason: `Email exceeds subscription member limit (position ${memberIndex + 1} of ${maxMembers} allowed)`,
      shouldBlock: true,
      memberIndex: memberIndex + 1,
      totalActiveMembers: activeMembers?.length || 0,
      subscriptionLimit: maxMembers
    };

  } catch (error) {
    console.error('Error checking email authorization:', error);
    return {
      authorized: false,
      reason: 'System error during authorization check',
      shouldBlock: false // Don't block due to system error
    };
  }
}

/**
 * Validate email authorization and provide detailed response
 * Returns a consistent response format for API usage
 */
export async function validateEmailAuthorization(email: string, subscription_id?: string) {
  const result = await isEmailAuthorized(email, subscription_id);

  return {
    success: result.authorized,
    authorized: result.authorized,
    shouldBlock: result.shouldBlock,
    message: result.reason,
    details: {
      memberStatus: result.memberStatus,
      memberIndex: result.memberIndex,
      totalActiveMembers: result.totalActiveMembers,
      subscriptionLimit: result.subscriptionLimit
    }
  };
}

/**
 * Get authorization status for multiple emails at once
 */
export async function bulkCheckEmailAuthorization(emails: string[], subscription_id?: string) {
  const results = await Promise.all(
    emails.map(email => validateEmailAuthorization(email, subscription_id))
  );

  const summary = {
    total: emails.length,
    authorized: results.filter(r => r.authorized).length,
    blocked: results.filter(r => r.shouldBlock).length,
    errors: results.filter(r => !r.shouldBlock && !r.authorized).length
  };

  return {
    summary,
    results: results.map((result, index) => ({
      email: emails[index],
      ...result
    }))
  };
}
