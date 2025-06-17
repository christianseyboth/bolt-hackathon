import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { ReportsGeneration } from '@/components/dashboard/reports/reports-generation';
import { ReportHistory } from '@/components/dashboard/reports/report-history';
import { QuickReports } from '@/components/dashboard/reports/quick-reports';
import { ScheduledReports } from '@/components/dashboard/reports/scheduled-reports';
import { getSubscriptionAccess, getFeatureRequiredPlan } from '@/lib/subscription-access';
import { SubscriptionAccessGate } from '@/components/dashboard/subscription-access-gate';

export default async function ReportsPage() {
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

    // Check subscription access
    const subscriptionAccess = await getSubscriptionAccess(user.id);

    if (!subscriptionAccess) {
        redirect('/login');
    }

    // If user doesn't have access to reports, show upgrade gate
    if (!subscriptionAccess.hasReportsAccess) {
        return (
            <>
                <DashboardHeader
                    heading='Reports & Analytics'
                    subheading='Generate, schedule, and download comprehensive security reports'
                />
                <SubscriptionAccessGate
                    feature='reports'
                    currentPlan={subscriptionAccess.planName}
                    requiredPlan={getFeatureRequiredPlan('reports')}
                />
            </>
        );
    }

    // Fetch report history and scheduled reports with proper error handling
    let reportHistory = [];
    let scheduledReports = [];

    try {
        const { data: reportHistoryData, error: historyError } = await supabase
            .from('report_history')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });

        if (!historyError) {
            reportHistory = reportHistoryData || [];
        }
    } catch (error) {
        console.warn('Report history table does not exist or query failed:', error);
        reportHistory = [];
    }

    try {
        const { data: scheduledReportsData, error: scheduledError } = await supabase
            .from('scheduled_reports')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });

        if (!scheduledError) {
            scheduledReports = scheduledReportsData || [];
        }
    } catch (error) {
        console.warn('Scheduled reports table does not exist or query failed:', error);
        scheduledReports = [];
    }

    return (
        <>
            <DashboardHeader
                heading='Reports & Analytics'
                subheading='Generate, schedule, and download comprehensive security reports'
            />

            <div className='grid grid-cols-1 [@media(min-width:768px)]:grid-cols-2 gap-6 mt-8'>
                <QuickReports accountId={accountId} />
                <ReportsGeneration accountId={accountId} />
            </div>

            <div className='grid grid-cols-1 [@media(min-width:1025px)]:grid-cols-2 gap-6 mt-6'>
                <ReportHistory accountId={accountId} initialReports={reportHistory || []} />
                <ScheduledReports
                    accountId={accountId}
                    initialScheduledReports={scheduledReports || []}
                />
            </div>
        </>
    );
}
