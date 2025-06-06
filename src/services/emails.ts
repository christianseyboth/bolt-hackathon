import { supabase } from '@/lib/supabase';

export type EmailAnalysisData = {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  status: 'clean' | 'suspicious' | 'phishing' | 'malware' | 'spam';
  userId: string;
  flagged?: boolean;
};

export async function getEmailAnalyses(
  userId: string,
  options: {
    limit?: number;
    page?: number;
    status?: string;
    searchQuery?: string;
  } = {}
) {
  const { limit = 10, page = 1, status, searchQuery } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('email_analyses')
    .select('*', { count: 'exact' })
    .eq('userId', userId)
    .order('receivedAt', { ascending: false });

  // Apply status filter if provided
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  // Apply search filter if provided
  if (searchQuery) {
    query = query.or(`sender.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
  }

  const { data, error, count } = await query
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching email analyses:', error);
    return { data: [], count: 0 };
  }

  return { data: data as EmailAnalysisData[], count: count || 0 };
}

export async function getEmailAnalysisById(id: string) {
  const { data, error } = await supabase
    .from('email_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching email analysis:', error);
    return null;
  }

  return data as EmailAnalysisData;
}

export async function getEmailAnalyticsData(userId: string, period: 'weekly' | 'monthly' = 'weekly') {
  const today = new Date();
  let startDate: Date;

  // Calculate start date based on period
  if (period === 'weekly') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
  } else {
    startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 1);
  }

  const { data, error } = await supabase
    .from('email_analyses')
    .select('*')
    .eq('userId', userId)
    .gte('receivedAt', startDate.toISOString())
    .lte('receivedAt', today.toISOString())
    .order('receivedAt', { ascending: true });

  if (error) {
    console.error('Error fetching email analytics data:', error);
    return { data: [] };
  }

  return { data: data as EmailAnalysisData[] };
}
