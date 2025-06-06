import { supabase } from '@/lib/supabase';

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    emailScans: number;
    aiAnalysis: number;
    teamMembers: number;
  };
};

export type SubscriptionStatus = {
  plan: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodEnd: Date;
  usage: {
    emailScans: {
      used: number;
      total: number;
    };
    aiAnalysis: {
      used: number;
      total: number;
    };
    teamMembers: {
      used: number;
      total: number;
    };
  };
};

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('userId', userId)
      .single();

    if (error) throw error;

    return {
      plan: data.plans.name,
      status: data.status,
      currentPeriodEnd: new Date(data.currentPeriodEnd),
      usage: {
        emailScans: {
          used: data.usage.emailScans || 0,
          total: data.plans.limits.emailScans,
        },
        aiAnalysis: {
          used: data.usage.aiAnalysis || 0,
          total: data.plans.limits.aiAnalysis,
        },
        teamMembers: {
          used: data.usage.teamMembers || 0,
          total: data.plans.limits.teamMembers,
        },
      }
    };
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return null;
  }
}

export async function getAvailablePlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('priceMonthly');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching available plans:', error);
    return [];
  }
}

export async function getInvoiceHistory(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching invoice history:', error);
    return [];
  }
}
