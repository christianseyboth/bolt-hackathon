import { getDateDaysAgo, getDateMonthsAgo } from "@/utils/metrics";

export async function getThreatHistory(
  supabase: any,
  account_id: string,
  mode: 'weekly' | 'monthly' | 'yearly'
) {
  let table, periodField, startPeriod, endPeriod;

  if (mode === 'weekly') {
    table = 'daily_threats';
    periodField = 'period';
    startPeriod = getDateDaysAgo(6).slice(0, 10);
    endPeriod = new Date().toISOString().slice(0, 10);

    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('account_id', account_id)
      .gte(periodField, startPeriod)
      .lte(periodField, endPeriod)
      .order(periodField, { ascending: true });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const weekdayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const mappedWeeklyData = last7Days
      .map(d => {
        const dayStr = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
        const dayRows = (data ?? []).filter((r: any) => r.period === dayStr);
        const threats = dayRows.reduce(
          (acc: any, row: any) => ({ ...acc, [row.threat_level]: row.count }),
          {}
        );
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          critical: threats.critical || 0,
          high: threats.high || 0,
          medium: threats.medium || 0,
          low: threats.low || 0,
        };
      })
      .sort((a, b) => weekdayOrder.indexOf(a.name) - weekdayOrder.indexOf(b.name));

    return mappedWeeklyData;

  } else if (mode === 'monthly') {
    table = 'daily_threats';
    periodField = 'period';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    startPeriod = `${year}-${month}-01`;
    endPeriod = `${year}-${month}-31`;

    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('account_id', account_id)
      .gte(periodField, startPeriod)
      .lte(periodField, endPeriod)
      .order(periodField, { ascending: true });

    const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
    const result = Array.from({ length: daysInMonth }, (_, i) => {
      const day = (i + 1).toString();
      const dayStr = `${year}-${month}-${String(i + 1).padStart(2, '0')}`;
      const dayRows = (data ?? []).filter((r: any) => r.period === dayStr);
      const threats = dayRows.reduce(
        (acc: any, row: any) => ({ ...acc, [row.threat_level]: row.count }),
        {}
      );
      return {
        name: day, // "1", "2", ...
        critical: threats.critical || 0,
        high: threats.high || 0,
        medium: threats.medium || 0,
        low: threats.low || 0,
      };
    });
    return result;


  } else {
    table = 'monthly_threats';
    periodField = 'period';
    startPeriod = getDateMonthsAgo(11).slice(0, 7);

    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('account_id', account_id)
      .gte(periodField, startPeriod)
      .order(periodField, { ascending: true });

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const now = new Date();
    const year = now.getFullYear();

    const result = months.map((month, idx) => {
      const monthNum = String(idx + 1).padStart(2, '0');
      const periodStr = `${year}-${monthNum}`;
      const monthRows = (data ?? []).filter((r: any) => r.period === periodStr);
      const threats = monthRows.reduce(
        (acc: any, row: any) => ({ ...acc, [row.threat_level]: row.count }),
        {}
      );
      return {
        name: month,
        critical: threats.critical || 0,
        high: threats.high || 0,
        medium: threats.medium || 0,
        low: threats.low || 0,
      };
    });

    return result;
  }
}
