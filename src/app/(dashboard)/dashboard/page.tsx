import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EmailAnalytics } from '@/components/dashboard/email-analytics';
import { SubscriptionInfo } from '@/components/dashboard/subscription-info';
import { SecurityScore } from '@/components/dashboard/security-score';
import { PhishingAttempts } from '@/components/dashboard/phishing-attempts';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { getAllEmailAnalytics } from './get-email-analytics';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }

    let { data: account_data, error: subscription_error } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    const { weekly: weeklyEmailStats, monthly: monthlyEmailStats } = await getAllEmailAnalytics(
        supabase,
        account_data.id,
        ['weekly', 'monthly']
    );

    return (
        <>
            <DashboardHeader
                heading={`Dashboard - Welcome, ${user.user_metadata.full_name || user.email}`}
                subheading='Monitor your email security and subscription status'
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-8'>
                <EmailAnalytics weeklyData={weeklyEmailStats} monthlyData={monthlyEmailStats} />
                <SubscriptionInfo />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                <SecurityScore />
                <PhishingAttempts />
                <RecentActivity />
            </div>
        </>
    );
}
