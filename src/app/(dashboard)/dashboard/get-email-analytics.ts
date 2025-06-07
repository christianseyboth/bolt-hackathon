const periods = ["weekly", "monthly"] as const;
type Period = typeof periods[number];

export async function getAllEmailAnalytics(
  supabase: any,
  accountId: string,
  periods: Period[]
) {
  const tableMap: Record<Period, { table: string; selectField: string }> = {
    weekly:  { table: "weekly_email_analytics",  selectField: "day_name, scanned, threats" },
    monthly: { table: "monthly_email_analytics", selectField: "week_label, scanned, threats" },

  };

  const results = await Promise.all(
    periods.map(period => {
      const { table, selectField } = tableMap[period];
      return supabase
        .from(table)
        .select(selectField)
        .eq("account_id", accountId);
    })
  );
  const mappedResults = periods.map((p, i) => {
    const data = results[i].data ?? [];
    if (p === 'weekly') return mapWeeklyData(data);
    if (p === 'monthly') return mapMonthlyData(data);
    return data;
  });

  return Object.fromEntries(periods.map((p, i) => [p, mappedResults[i]]));
}

// Helpers
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];


function mapWeeklyData(rawData: any[]) {
  // Index for quick lookup
  const dataMap = Object.fromEntries(rawData.map(d => [d.day_name, d]));
  // Fill missing days with 0
  return weekDays.map(day => ({
    name: day,
    scanned: dataMap[day]?.scanned ?? 0,
    threats: dataMap[day]?.threats ?? 0,
  }));
}

function mapMonthlyData(rawData: any[]) {
  const dataMap = Object.fromEntries(rawData.map(d => [d.week_label, d]));

  return weekLabels.map(week => ({
    name: week,
    scanned: dataMap[week]?.scanned ?? 0,
    threats: dataMap[week]?.threats ?? 0,
  }));
}
