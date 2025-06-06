export async function getThreatCategories(
    supabase: any,
    account_id: string,
    mode: 'weekly' | 'monthly' | 'yearly'
  ) {
    let table, periodField, currentPeriod;

    if (mode === 'weekly') {
      table = 'weekly_threat_categories';
      periodField = 'period';

      const now = new Date();
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = String(Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)).padStart(2, "0");
      currentPeriod = `${now.getFullYear()}-${weekNumber}`;

      const { data } = await supabase
        .from(table)
        .select('category, count')
        .eq('account_id', account_id)
        .eq(periodField, currentPeriod)
        .order('count', { ascending: false });

      return (data ?? []).map((row: any) => ({
        category: row.category?.charAt(0).toUpperCase() + row.category?.slice(1),
        count: row.count,
      }));

    } else if (mode === 'monthly') {
      table = 'monthly_threat_categories';
      periodField = 'period';
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      currentPeriod = `${now.getFullYear()}-${month}`;

      const { data } = await supabase
        .from(table)
        .select('category, count')
        .eq('account_id', account_id)
        .eq(periodField, currentPeriod)
        .order('count', { ascending: false });

      return (data ?? []).map((row: any) => ({
        category: row.category?.charAt(0).toUpperCase() + row.category?.slice(1),
        count: row.count,
      }));

    } else if (mode === 'yearly') {
      table = 'monthly_threat_categories';
      periodField = 'period';
      const now = new Date();
      const year = now.getFullYear();

      const { data } = await supabase
        .from(table)
        .select('category, count, period')
        .eq('account_id', account_id)
        .gte(periodField, `${year}-01`)
        .lte(periodField, `${year}-12`);

      const summary: Record<string, number> = {};
      for (const row of data ?? []) {
        const cat = row.category?.charAt(0).toUpperCase() + row.category?.slice(1);
        summary[cat] = (summary[cat] || 0) + row.count;
      }

      return Object.entries(summary)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    }
  }
