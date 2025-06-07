import { getThreatCategories } from '@/utils/threat-category'

const periods = ["weekly", "monthly", "yearly"] as const;
type Period = typeof periods[number];

export async function getAllThreatCategoryData (
    supabase: any,
    account_id: string,
    periods: Period[]
) {
    const results = await Promise.all(
        periods.map(period => getThreatCategories(supabase, account_id, period))
    );

    return Object.fromEntries(periods.map((p, i) => [p, results[i]]));
}
