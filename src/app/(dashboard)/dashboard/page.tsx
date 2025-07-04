﻿import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmailAnalytics } from '@/components/dashboard/EmailAnalytics';
import { SubscriptionInfo } from '@/components/dashboard/SubscriptionInfo';
import { SecurityScore } from '@/components/dashboard/SecurityScore';
import { PhishingAttempts } from '@/components/dashboard/PhishingAttempts';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { getAllEmailAnalytics } from './get-email-analytics';
import { ClientToastHandler } from '@/components/ui/ClientToaster';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }

    let { data: account_data } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    const accountId = account_data?.id;

    const subscriptionPromise = supabase
        .from('subscriptions')
        .select('*')
        .eq('account_id', accountId)
        .single();

    const [
        { weekly: weeklyEmailStats, monthly: monthlyEmailStats },
        { data: events },
        { data: attempts },
        { data: recentActivities },
        { data: subscription_data },
    ] = await Promise.all([
        getAllEmailAnalytics(supabase, accountId, ['weekly', 'monthly']),
        supabase.from('security_score_dashboard').select('*').eq('account_id', accountId).single(),
        supabase
            .from('latest_phishing_events')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false })
            .limit(5),
        supabase
            .from('recent_activity_dashboard')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false })
            .limit(5),
        subscriptionPromise,
    ]);

    return (
        <>
            <ClientToastHandler />
            <DashboardHeader
                heading={`Dashboard - Welcome, ${user.user_metadata.full_name || user.email}`}
                subheading='Monitor your email security and subscription status'
            />
            <div className='grid grid-cols-1 [@media(min-width:768px)]:grid-cols-2 gap-4 mt-8'>
                <EmailAnalytics weeklyData={weeklyEmailStats} monthlyData={monthlyEmailStats} />
                <SubscriptionInfo account={account_data} subscription={subscription_data} />
            </div>
            <div className='grid grid-cols-1 [@media(min-width:768px)]:grid-cols-2 [@media(min-width:1025px)]:grid-cols-3 gap-4 mt-4'>
                <SecurityScore scoreData={events} />
                <PhishingAttempts attempts={attempts} />
                <RecentActivity activities={recentActivities} />
            </div>
        </>
    );
}
