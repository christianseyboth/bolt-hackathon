import { getThreatHistory } from "@/utils/threat-history";

const periods = ["weekly", "monthly", "yearly"] as const;
type Period = typeof periods[number];


export async function getAllThreatHistoryData(
  supabase: any,
  account_id: string,
  periods: Period[]
) {
  const results = await Promise.all(
    periods.map(period => getThreatHistory(supabase, account_id, period))
  );

  return Object.fromEntries(periods.map((p, i) => [p, results[i]]));
}
