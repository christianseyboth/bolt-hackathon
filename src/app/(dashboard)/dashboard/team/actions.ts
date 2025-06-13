"use server"
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from "next/cache";

export async function addTeamMember(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "");
  const label = String(formData.get("note") || "");
  const subscription_id = String(formData.get("subscriptionId") || "");
  const created_by = String(formData.get("createdBy") || "");

  // Get subscription details to check limits
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('seats')
    .eq('id', subscription_id)
    .single();

  if (subError) {
    throw new Error(`Error fetching subscription: ${subError.message}`);
  }

  // Get current member count
  const { data: currentMembers, error: membersError } = await supabase
    .from('authorized_addresses')
    .select('id')
    .eq('subscription_id', subscription_id);

  if (membersError) {
    throw new Error(`Error fetching current members: ${membersError.message}`);
  }

  const currentMemberCount = currentMembers?.length || 0;
  const maxMembers = subscription.seats;

  // Check if adding this member would exceed the limit
  if (currentMemberCount >= maxMembers) {
    throw new Error(
      `Cannot add team member. You have reached the maximum of ${maxMembers} members allowed by your subscription. Please upgrade your plan or remove existing members first.`
    );
  }

  // Check if email already exists for this subscription
  const { data: existingMember, error: existingError } = await supabase
    .from('authorized_addresses')
    .select('id')
    .eq('subscription_id', subscription_id)
    .eq('email', email)
    .single();

  if (existingMember) {
    throw new Error(`Team member with email ${email} already exists.`);
  }

  const { data, error } = await supabase
    .from('authorized_addresses')
    .insert([{ email, label, subscription_id, created_by }])
    .select();

  if (error) {
    throw new Error(`Error adding team member: ${error.message}`);
  }

  revalidatePath("/dashboard/team")
  return data;
}

export async function removeTeamMember(formData: FormData) {
  const memberId = String(formData.get("id") || "");
  if (!memberId) throw new Error("No member ID");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('authorized_addresses')
    .delete()
    .eq('id', memberId)
    .select();

  if (error) {
    throw new Error(`Error removing team member: ${error.message}`);
  }

  revalidatePath("/dashboard/team");
}

/**
 * Enforces subscription limits by disabling excess team members
 * This function automatically disables members that exceed the subscription limit
 */
export async function enforceSubscriptionLimits(subscription_id: string) {
  const supabase = await createClient();

  // Get subscription details
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('seats')
    .eq('id', subscription_id)
    .single();

  if (subError) {
    throw new Error(`Error fetching subscription: ${subError.message}`);
  }

  const maxMembers = subscription.seats;

  // Get all members ordered by created_at (oldest first) to preserve seniority
  const { data: allMembers, error: membersError } = await supabase
    .from('authorized_addresses')
    .select('id, email, status, created_at')
    .eq('subscription_id', subscription_id)
    .order('created_at', { ascending: true });

  if (membersError) {
    throw new Error(`Error fetching members: ${membersError.message}`);
  }

  const results = {
    total_members: allMembers?.length || 0,
    max_allowed: maxMembers,
    members_disabled: 0,
    members_enabled: 0,
    is_over_limit: false
  };

  if (!allMembers || allMembers.length <= maxMembers) {
    // Within limits - ensure all members are active
    if (allMembers && allMembers.length > 0) {
      const { error: enableError } = await supabase
        .from('authorized_addresses')
        .update({ status: 'active' })
        .eq('subscription_id', subscription_id);

      if (enableError) {
        console.error('Error enabling members:', enableError);
      } else {
        results.members_enabled = allMembers.length;
      }
    }
    return results;
  }

    // Over limits - disable excess members (newest members first)
  results.is_over_limit = true;
  const membersToDisable = allMembers.slice(maxMembers);
  const membersToKeepActive = allMembers.slice(0, maxMembers);

    // Disable excess members by setting status to 'inactive'
  // (Valid status values: 'active', 'inactive', 'cancelled', 'past_due')
  if (membersToDisable.length > 0) {
    const memberIdsToDisable = membersToDisable.map(m => m.id);

    const { error: disableError } = await supabase
      .from('authorized_addresses')
      .update({ status: 'inactive' })
      .in('id', memberIdsToDisable);

    if (disableError) {
      throw new Error(`Error disabling excess members: ${disableError.message}`);
    }

    results.members_disabled = membersToDisable.length;
  }

  // Ensure allowed members are active
  if (membersToKeepActive.length > 0) {
    const memberIdsToEnable = membersToKeepActive.map(m => m.id);

    const { error: enableError } = await supabase
      .from('authorized_addresses')
      .update({ status: 'active' })
      .in('id', memberIdsToEnable);

    if (enableError) {
      console.error('Error enabling allowed members:', enableError);
    } else {
      results.members_enabled = membersToKeepActive.length;
    }
  }

  return results;
}

/**
 * Manually trigger subscription limit enforcement for a team
 */
export async function enforceTeamLimits(subscription_id: string) {
  try {
    const results = await enforceSubscriptionLimits(subscription_id);
    revalidatePath("/dashboard/team");
    return { success: true, results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if an email address is authorized and active for a subscription
 * This function respects subscription limits and member status
 */
export async function isEmailAuthorized(email: string, subscription_id: string) {
  const supabase = await createClient();

  // Get the member record
  const { data: member, error } = await supabase
    .from('authorized_addresses')
    .select('id, email, status, created_at')
    .eq('subscription_id', subscription_id)
    .eq('email', email)
    .single();

  if (error || !member) {
    return { authorized: false, reason: 'Email not found in authorized addresses' };
  }

  // Check if member is active
  if (member.status !== 'active') {
    return {
      authorized: false,
      reason: member.status === 'inactive'
        ? 'Email address disabled due to subscription limits'
        : `Email address status: ${member.status}`
    };
  }

  // Additional check: verify subscription limits in real-time
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('seats')
    .eq('id', subscription_id)
    .single();

  if (subError) {
    return { authorized: false, reason: 'Unable to verify subscription' };
  }

  // Count active members
  const { data: activeMembers, error: countError } = await supabase
    .from('authorized_addresses')
    .select('id, created_at')
    .eq('subscription_id', subscription_id)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (countError) {
    return { authorized: false, reason: 'Unable to verify member count' };
  }

  const maxMembers = subscription.seats;
  const memberIndex = activeMembers?.findIndex(m => m.id === member.id) ?? -1;

  // Check if this member is within the allowed limit (oldest members get priority)
  if (memberIndex >= 0 && memberIndex < maxMembers) {
    return { authorized: true, reason: 'Email authorized and within subscription limits' };
  }

  return {
    authorized: false,
    reason: 'Email exceeds subscription member limit'
  };
}
