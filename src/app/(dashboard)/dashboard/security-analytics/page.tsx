import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SecurityOverview } from '@/components/dashboard/security/SecurityOverview';
import { RiskiestSenders } from '@/components/dashboard/security/RiskiestSenders';
import { AttackTypes } from '@/components/dashboard/security/AttackTypes';
import { ThreatHistoryChart } from '@/components/dashboard/security/ThreatHistoryChart';
import { ThreatCategoryChart } from '@/components/dashboard/security/ThreatCategoryChart';
import { TopAttackTargetsChart } from '@/components/dashboard/security/TopAttackTargetsChart';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {
    IconShieldCheck,
    IconShieldX,
    IconAlertOctagon,
    IconUserExclamation,
} from '@tabler/icons-react';
import { getStatistics } from './get-statistics';
import { getAllThreatHistoryData } from './get-threat-history';
import { getAllThreatCategoryData } from './get-threat-categories';
import { getSubscriptionAccess, getFeatureRequiredPlan } from '@/lib/subscription-access';
import { SubscriptionAccessGate } from '@/components/dashboard/SubscriptionAccessGate';

export default async function SecurityPage() {
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

    const accountId = account_data.id;

    // Check subscription access
    const subscriptionAccess = await getSubscriptionAccess(user.id);

    if (!subscriptionAccess) {
        redirect('/login');
    }

    // If user doesn't have access to security analytics, show upgrade gate
    if (!subscriptionAccess.hasSecurityAnalyticsAccess) {
        return (
            <>
                <DashboardHeader
                    heading='Security Analytics'
                    subheading='Comprehensive analysis of your email security posture'
                />
                <SubscriptionAccessGate
                    feature='security-analytics'
                    currentPlan={subscriptionAccess.planName}
                    requiredPlan={getFeatureRequiredPlan('security-analytics')}
                />
            </>
        );
    }

    // 2. PARALLEL DATA FETCHING
    const [statisticsRes, threatHistory, threatCategories, riskiestSendersRes, topTargetsRes] =
        await Promise.all([
            getStatistics(supabase, accountId),
            getAllThreatHistoryData(supabase, accountId, ['weekly', 'monthly', 'yearly']),
            getAllThreatCategoryData(supabase, accountId, ['weekly', 'monthly', 'yearly']),
            supabase
                .from('riskiest_sender_domains')
                .select('*')
                .eq('account_id', accountId)
                .order('risk_score', { ascending: false })
                .limit(10),
            supabase.from('top_attack_targets').select('*').eq('account_id', accountId),
        ]);

    // 3. Prepare statistics for overview component
    const {
        analyzedChange,
        threatsChange,
        falseChange,
        targetChange,
        analyzedNow,
        threatsNow,
        falseNow,
        targetUserNow,
    } = statisticsRes;

    const statistics = [
        {
            id: 'total-emails',
            label: 'Emails Analyzed',
            value: analyzedNow,
            change: analyzedChange,
            period: 'vs last month',
            icon: <IconShieldCheck className='h-5 w-5 text-emerald-400' />,
            color: 'emerald',
        },
        {
            id: 'threats-detected',
            label: 'Threats Detected',
            value: threatsNow,
            change: threatsChange,
            period: 'vs last month',
            icon: <IconShieldX className='h-5 w-5 text-red-400' />,
            color: 'red',
        },
        {
            id: 'false-positives',
            label: 'False Positives',
            value: falseNow,
            change: falseChange,
            period: 'vs last month',
            icon: <IconAlertOctagon className='h-5 w-5 text-amber-400' />,
            color: 'amber',
        },
        {
            id: 'targeted-users',
            label: 'Most Targeted Users',
            value: targetUserNow,
            change: targetChange,
            period: 'vs last month',
            icon: <IconUserExclamation className='h-5 w-5 text-cyan-400' />,
            color: 'cyan',
        },
    ];

    const { monthly: monthlyHistory, weekly: weeklyHistory, yearly: yearlyHistory } = threatHistory;
    const { monthly: monthlyCats, weekly: weeklyCats, yearly: yearlyCats } = threatCategories;
    const riskiestSenders = riskiestSendersRes.data ?? [];
    const topTargets = topTargetsRes.data ?? [];

    return (
        <>
            <DashboardHeader
                heading='Security Analytics'
                subheading='Comprehensive analysis of your email security posture'
            />

            <div className='mt-8'>
                <SecurityOverview statistics={statistics} />
            </div>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                <ThreatHistoryChart
                    weeklyData={weeklyHistory}
                    monthlyData={monthlyHistory}
                    yearlyData={yearlyHistory}
                />
                <ThreatCategoryChart
                    weeklyData={weeklyCats}
                    monthlyData={monthlyCats}
                    yearlyData={yearlyCats}
                />
            </div>

            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                <RiskiestSenders riskiestSenders={riskiestSenders} />
                <AttackTypes yearlyAttackDataTypes={yearlyCats} />
            </div>

            <div className='mt-6'>
                <TopAttackTargetsChart topTargets={topTargets} />
            </div>
        </>
    );
}
