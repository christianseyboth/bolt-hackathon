import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EmailAnalytics } from '@/components/dashboard/email-analytics';
import { SubscriptionInfo } from '@/components/dashboard/subscription-info';
import { SecurityScore } from '@/components/dashboard/security-score';
import { PhishingAttempts } from '@/components/dashboard/phishing-attempts';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }

    return (
        <>
            <DashboardHeader
                heading={`Dashboard - Welcome, ${user.user_metadata.full_name || user.email}`}
                subheading='Monitor your email security and subscription status'
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-8'>
                <EmailAnalytics />
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
