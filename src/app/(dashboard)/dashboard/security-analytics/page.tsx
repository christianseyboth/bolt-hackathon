import React from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SecurityOverview } from '@/components/dashboard/security/security-overview';
import { RiskiestSenders } from '@/components/dashboard/security/riskiest-senders';
import { AttackTypes } from '@/components/dashboard/security/attack-types';
import { ThreatHistoryChart } from '@/components/dashboard/security/threat-history-chart';
import { ThreatCategoryChart } from '@/components/dashboard/security/threat-category-chart';
import { TopAttackTargetsChart } from '@/components/dashboard/security/top-attack-targets-chart';
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
    const {
        analyzedChange,
        threatsChange,
        falseChange,
        targetChange,
        analyzedNow,
        threatsNow,
        falseNow,
        targetUserNow,
    } = await getStatistics(supabase, account_data.id);

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

    const {
        monthly: monthlyHistory,
        weekly: weeklyHistory,
        yearly: yearlyHistory,
    } = await getAllThreatHistoryData(supabase, account_data.id, ['weekly', 'monthly', 'yearly']);

    const {
        monthly: monthlyCats,
        weekly: weeklyCats,
        yearly: yearlyCats,
    } = await getAllThreatCategoryData(supabase, account_data.id, ['weekly', 'monthly', 'yearly']);
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
                <RiskiestSenders />
                <AttackTypes />
            </div>

            <div className='mt-6'>
                <TopAttackTargetsChart />
            </div>
        </>
    );
}
