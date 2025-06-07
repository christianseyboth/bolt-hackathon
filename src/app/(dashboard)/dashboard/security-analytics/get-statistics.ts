import { getDateDaysAgo, getCount, percentChange } from "@/utils/metrics";

export async function getStatistics(supabase: any, account_id: string) {
  const lastMonth = getDateDaysAgo(30);

  const [
    analyzedNow,
    analyzedPrev,
    threatsNow,
    threatsPrev,
    falseNow,
    falsePrev,
    targetUserNow,
    targetUserPrev
  ] = await Promise.all([
    getCount(supabase, 'mail_events', {
      account_id,
      created_at: { gte: lastMonth },
    }),
    getCount(supabase, 'mail_events', {
      account_id,
      created_at: { lt: lastMonth },
    }),
    getCount(supabase, 'mail_events', {
      account_id,
      threat_level: ['medium', 'high'],
      created_at: { gte: lastMonth },
    }),
    getCount(supabase, 'mail_events', {
      account_id,
      threat_level: ['medium', 'high'],
      created_at: { lt: lastMonth },
    }),
    getCount(supabase, 'mail_events', {
      account_id,
      false_positive: true,
      created_at: { gte: lastMonth },
    }),
    getCount(supabase, 'mail_events', {
      account_id,
      false_positive: true,
      created_at: { lt: lastMonth },
    }),
    getCount(supabase, 'mail_events_from_stats', {
      account_id,
      last_seen: { gte: lastMonth },
    }),
    getCount(supabase, 'mail_events_from_stats', {
      account_id,
      last_seen: { lt: lastMonth },
    }),
  ]);

  const analyzedChange = percentChange(analyzedNow, analyzedPrev);
  const threatsChange = percentChange(threatsNow, threatsPrev);
  const falseChange = percentChange(falseNow, falsePrev);
  const targetChange = percentChange(targetUserNow, targetUserPrev);

  return {
    analyzedChange,
    analyzedNow,
    threatsChange,
    threatsNow,
    falseChange,
    falseNow,
    targetChange,
    targetUserNow,
  };
}
