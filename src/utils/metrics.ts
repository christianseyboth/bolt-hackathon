export type CountFilter = Record<string, string | number | boolean | { gte?: string; lt?: string } | (string | number)[]>;



export function percentChange(current: number, prev: number): string {
  if (prev && prev > 0) return ((current - prev) / prev * 100).toFixed(0) + '%';
  if (current > 0) return '+100%';
  return '0%';
}

export async function getCount(
  supabase: any,
  table: string,
  filters: Record<string, any>
): Promise<number> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });

  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      query = query.in(key, value);
    } else if (typeof value === 'object' && value !== null && ('gte' in value || 'lt' in value)) {
      if ('gte' in value) query = query.gte(key, value.gte);
      if ('lt' in value) query = query.lt(key, value.lt);
    } else {
      query = query.eq(key, value);
    }
  }

  const { count } = await query;
  return count || 0;
}


export function getDateDaysAgo(days: number = 30): string {
  const now = new Date();
  now.setDate(now.getDate() - days);
  return now.toISOString();
}

export function getDateMonthsAgo(months: number = 1): string {
  const now = new Date();
  now.setMonth(now.getMonth() - months);
  return now.toISOString();
}

