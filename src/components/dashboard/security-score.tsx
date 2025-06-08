import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { IconInfoCircle, IconShieldCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type SecurityScoreData = {
    account_id: string;
    total_events: number;
    avg_risk_score: number;
    false_positives: number;
    criticals: number;
    highs: number;
    relevant_threats: number;
    security_score: number;
    last_event_at: string;
};

export function SecurityScore({ scoreData }: { scoreData: SecurityScoreData }) {
    if (!scoreData) {
        return (
            <Card className='border border-neutral-800 bg-neutral-900'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-lg font-medium flex items-center'>
                        <IconShieldCheck className='mr-2 h-5 w-5 text-emerald-400' />
                        Security Score
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col items-center justify-center pt-6 pb-8 text-neutral-400'>
                        <div className='text-3xl mb-2'>–</div>
                        <div className='mb-3'>Not enough data yet</div>
                        <div className='text-xs'>
                            Start forwarding emails for analysis to see your score!
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { security_score, last_event_at } = scoreData;

    const getProgressColor = (value: number) => {
        if (value >= 85) return 'bg-emerald-400';
        if (value >= 70) return 'bg-lime-400';
        if (value >= 55) return 'bg-amber-400';
        if (value >= 40) return 'bg-orange-400';
        return 'bg-red-500';
    };

    const getScoreLabel = (value: number) => {
        if (value >= 85) return { label: 'Excellent', color: 'text-emerald-400' };
        if (value >= 70) return { label: 'Good', color: 'text-lime-400' };
        if (value >= 55) return { label: 'Medium', color: 'text-amber-400' };
        if (value >= 40) return { label: 'Low', color: 'text-orange-400' };
        return { label: 'Poor', color: 'text-red-500' };
    };
    const scoreMeta = getScoreLabel(security_score);

    const formatDate = (isoString: string) => {
        if (!isoString) return '-';
        const d = new Date(isoString);
        return d.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className='border border-neutral-800 bg-neutral-900'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium flex items-center'>
                    <IconShieldCheck className='mr-2 h-5 w-5 text-emerald-400' />
                    Security Score
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col items-center justify-center pt-2'>
                    <div className={cn('text-5xl font-bold mb-4', scoreMeta.color)}>
                        {security_score}
                    </div>
                    <Progress
                        value={security_score}
                        className='h-2 w-full'
                        indicatorClassName={getProgressColor(security_score)}
                    />

                    <div className='flex items-center text-xs text-neutral-400 mt-6'>
                        Your email security score is in the{' '}
                        <span className={cn('font-medium ml-1 mr-1', scoreMeta.color)}>
                            {scoreMeta.label}
                        </span>
                        range.
                        <span className='ml-2 group relative'>
                            <IconInfoCircle className='h-5 w-5 text-neutral-500 group-hover:text-neutral-300 cursor-pointer' />
                            <span className='absolute left-6 top-0 z-10 hidden group-hover:block bg-neutral-800 text-xs text-neutral-100 p-2 rounded shadow-lg w-[250px]'>
                                Score based on detected threats, average risk, false positives, and
                                their severity in the last 30 days. Fewer critical or high risk
                                incidents increase your score.
                                <br />
                                <br />
                                <b>Calculation:</b>
                                <br />
                                100 – (avg_risk_score × 0.5) – (false_positives × 2) – (criticals ×
                                5) – (highs × 2) – (relevant_threats × 1.5)
                            </span>
                        </span>
                    </div>
                    <div className='text-xs text-neutral-400 mt-2'>
                        Last updated: {formatDate(last_event_at)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
