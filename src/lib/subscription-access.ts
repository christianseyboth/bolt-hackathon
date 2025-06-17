import { createClient } from '@/utils/supabase/server';

export interface SubscriptionAccess {
    hasReportsAccess: boolean;
    hasSecurityAnalyticsAccess: boolean;
    hasApiAccess: boolean;
    planName: string;
    isFreePlan: boolean;
}

export async function getSubscriptionAccess(userId: string): Promise<SubscriptionAccess | null> {
    try {
        const supabase = await createClient();

        // Get user's account
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('id')
            .eq('owner_id', userId)
            .single();

        if (accountError || !account) {
            return null;
        }

        // Get current active subscription
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('plan_name, subscription_status')
            .eq('account_id', account.id)
            .eq('subscription_status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (subscriptionError || !subscription) {
            // Default to Free plan if no subscription found
            return {
                hasReportsAccess: true, // Free plans can access all features
                hasSecurityAnalyticsAccess: true,
                hasApiAccess: true,
                planName: 'Free',
                isFreePlan: true,
            };
        }

        const planName = subscription.plan_name;
        const isFreePlan = planName === 'Free';

        // Define access rules based on subscription plans
        let hasReportsAccess = true; // Free plans can access all features
        let hasSecurityAnalyticsAccess = true;
        let hasApiAccess = true;

        if (!isFreePlan) {
            // Paid plan restrictions
            switch (planName) {
                case 'Solo':
                    hasReportsAccess = false;
                    hasSecurityAnalyticsAccess = false;
                    hasApiAccess = false;
                    break;
                case 'Entrepreneur':
                    hasReportsAccess = false;
                    hasSecurityAnalyticsAccess = true;
                    hasApiAccess = false;
                    break;
                case 'Team':
                    hasReportsAccess = true;
                    hasSecurityAnalyticsAccess = true;
                    hasApiAccess = true;
                    break;
                default:
                    // Unknown plan, default to no access
                    hasReportsAccess = false;
                    hasSecurityAnalyticsAccess = false;
                    hasApiAccess = false;
            }
        }

        return {
            hasReportsAccess,
            hasSecurityAnalyticsAccess,
            hasApiAccess,
            planName,
            isFreePlan,
        };
    } catch (error) {
        console.error('Error checking subscription access:', error);
        return null;
    }
}

export function getFeatureRequiredPlan(feature: 'reports' | 'security-analytics' | 'api'): string {
    switch (feature) {
        case 'reports':
            return 'Team';
        case 'security-analytics':
            return 'Entrepreneur';
        case 'api':
            return 'Team';
        default:
            return 'Free';
    }
}
