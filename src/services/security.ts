import { supabase } from '@/lib/supabase';

export type SecurityOverviewData = {
  totalEmails: number;
  threatsDetected: number;
  falsePositives: number;
  targetedUsers: number;
  changePercentage: {
    emails: number;
    threats: number;
    falsePositives: number;
    targetedUsers: number;
  };
};

export type RiskiestSender = {
  domain: string;
  emails: number;
  riskScore: number;
  category: string;
};

export type AttackType = {
  name: string;
  count: number;
  percentage: number;
  color: string;
};

export async function getSecurityOverview(orgId: string): Promise<SecurityOverviewData | null> {
  // Get current period data
  const currentPeriodEnd = new Date();
  const currentPeriodStart = new Date();
  currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1);

  // Get previous period data for comparison
  const previousPeriodEnd = new Date(currentPeriodStart);
  const previousPeriodStart = new Date(previousPeriodEnd);
  previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);

  try {
    // Fetch current period stats
    const { data: currentData, error: currentError } = await supabase
      .from('security_stats')
      .select('*')
      .eq('orgId', orgId)
      .gte('date', currentPeriodStart.toISOString())
      .lte('date', currentPeriodEnd.toISOString())
      .single();

    if (currentError) throw currentError;

    // Fetch previous period stats for comparison
    const { data: previousData, error: previousError } = await supabase
      .from('security_stats')
      .select('*')
      .eq('orgId', orgId)
      .gte('date', previousPeriodStart.toISOString())
      .lte('date', previousPeriodEnd.toISOString())
      .single();

    if (previousError && previousError.code !== 'PGRST116') throw previousError;

    // Calculate change percentages
    const calcPercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const overview: SecurityOverviewData = {
      totalEmails: currentData.totalEmails || 0,
      threatsDetected: currentData.threatsDetected || 0,
      falsePositives: currentData.falsePositives || 0,
      targetedUsers: currentData.targetedUsers || 0,
      changePercentage: {
        emails: previousData ? calcPercentageChange(currentData.totalEmails, previousData.totalEmails) : 0,
        threats: previousData ? calcPercentageChange(currentData.threatsDetected, previousData.threatsDetected) : 0,
        falsePositives: previousData ? calcPercentageChange(currentData.falsePositives, previousData.falsePositives) : 0,
        targetedUsers: previousData ? calcPercentageChange(currentData.targetedUsers, previousData.targetedUsers) : 0,
      }
    };

    return overview;
  } catch (error) {
    console.error('Error fetching security overview:', error);
    return null;
  }
}

export async function getRiskiestSenders(orgId: string, limit = 10): Promise<RiskiestSender[]> {
  try {
    const { data, error } = await supabase
      .from('risky_senders')
      .select('*')
      .eq('orgId', orgId)
      .order('riskScore', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data as RiskiestSender[];
  } catch (error) {
    console.error('Error fetching riskiest senders:', error);
    return [];
  }
}

export async function getAttackTypes(orgId: string): Promise<AttackType[]> {
  try {
    const { data, error } = await supabase
      .from('attack_types')
      .select('*')
      .eq('orgId', orgId)
      .order('count', { ascending: false });

    if (error) throw error;

    // Calculate percentages
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const attackTypes = data.map(item => ({
      ...item,
      percentage: Math.round((item.count / total) * 100)
    }));

    return attackTypes as AttackType[];
  } catch (error) {
    console.error('Error fetching attack types:', error);
    return [];
  }
}

export async function getThreatHistoryData(
  orgId: string,
  period: 'weekly' | 'monthly' | 'quarterly' = 'weekly'
) {
  const today = new Date();
  let startDate: Date;

  // Calculate start date based on period
  if (period === 'weekly') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
  } else if (period === 'monthly') {
    startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 1);
  } else {
    startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 3);
  }

  try {
    const { data, error } = await supabase
      .from('threat_history')
      .select('*')
      .eq('orgId', orgId)
      .gte('date', startDate.toISOString())
      .lte('date', today.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching threat history data:', error);
    return [];
  }
}
