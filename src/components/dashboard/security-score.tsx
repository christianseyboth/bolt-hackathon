import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { IconInfoCircle, IconShieldCheck, IconAlertTriangle, IconCircle } from '@tabler/icons-react';
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

interface ScoreMetadata {
    label: string;
    color: string;
    description: string;
    recommendation: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}

const SCORE_RANGES = {
    EXCELLENT: {
        min: 85,
        label: 'Excellent',
        color: 'text-emerald-400',
        description: 'Outstanding security posture',
        recommendation: 'Keep up the great work! Your email security is performing excellently.',
        urgency: 'low' as const
    },
    GOOD: {
        min: 70,
        label: 'Good',
        color: 'text-lime-400',
        description: 'Strong security with minor issues',
        recommendation: 'Great job! Monitor for any emerging threats and maintain current practices.',
        urgency: 'low' as const
    },
    MEDIUM: {
        min: 55,
        label: 'Medium',
        color: 'text-amber-400',
        description: 'Moderate security concerns',
        recommendation: 'Review your email filters and security policies. Some threats are getting through.',
        urgency: 'medium' as const
    },
    LOW: {
        min: 40,
        label: 'Low',
        color: 'text-orange-400',
        description: 'Significant security risks',
        recommendation: 'Take immediate action to improve your email security settings and policies.',
        urgency: 'high' as const
    },
    POOR: {
        min: 0,
        label: 'Poor',
        color: 'text-red-500',
        description: 'Critical security vulnerabilities',
        recommendation: 'Urgent action required! Multiple high-risk threats detected. Review all security settings immediately.',
        urgency: 'critical' as const
    }
} as const;

const PROGRESS_COLORS = {
    EXCELLENT: 'bg-emerald-400',
    GOOD: 'bg-lime-400',
    MEDIUM: 'bg-amber-400',
    LOW: 'bg-orange-400',
    POOR: 'bg-red-500'
} as const;

export function SecurityScore({ scoreData }: { scoreData: SecurityScoreData }) {
    const calculatedScore = useMemo(() => {
        if (!scoreData) return null;

        const {
            avg_risk_score,
            false_positives,
            criticals,
            highs,
            relevant_threats,
            security_score
        } = scoreData;

        // If backend provides a valid score (> 0), use it
        if (security_score > 0) {
            return Math.max(0, Math.min(100, security_score));
        }

        // Calculate score on frontend using the formula
        const baseScore = 100;
        const riskPenalty = (avg_risk_score || 0) * 0.5;
        const falsePositivePenalty = (false_positives || 0) * 2;
        const criticalPenalty = (criticals || 0) * 5;
        const highPenalty = (highs || 0) * 2;
        const threatPenalty = (relevant_threats || 0) * 1.5;

        const calculatedValue = baseScore - riskPenalty - falsePositivePenalty -
            criticalPenalty - highPenalty - threatPenalty;

        // Ensure score is between 0 and 100
        return Math.max(0, Math.min(100, Math.round(calculatedValue)));
    }, [scoreData]);

    const scoreMetadata = useMemo((): ScoreMetadata => {
        if (calculatedScore === null) return SCORE_RANGES.POOR;

        if (calculatedScore >= SCORE_RANGES.EXCELLENT.min) return SCORE_RANGES.EXCELLENT;
        if (calculatedScore >= SCORE_RANGES.GOOD.min) return SCORE_RANGES.GOOD;
        if (calculatedScore >= SCORE_RANGES.MEDIUM.min) return SCORE_RANGES.MEDIUM;
        if (calculatedScore >= SCORE_RANGES.LOW.min) return SCORE_RANGES.LOW;
        return SCORE_RANGES.POOR;
    }, [calculatedScore]);

    const progressColor = useMemo(() => {
        if (calculatedScore === null) return PROGRESS_COLORS.POOR;

        if (calculatedScore >= SCORE_RANGES.EXCELLENT.min) return PROGRESS_COLORS.EXCELLENT;
        if (calculatedScore >= SCORE_RANGES.GOOD.min) return PROGRESS_COLORS.GOOD;
        if (calculatedScore >= SCORE_RANGES.MEDIUM.min) return PROGRESS_COLORS.MEDIUM;
        if (calculatedScore >= SCORE_RANGES.LOW.min) return PROGRESS_COLORS.LOW;
        return PROGRESS_COLORS.POOR;
    }, [calculatedScore]);

    const formatDate = (isoString: string): string => {
        if (!isoString) return 'Never';
        try {
            const date = new Date(isoString);
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getUrgencyIcon = (urgency: string) => {
        switch (urgency) {
            case 'critical':
            case 'high':
                return <IconAlertTriangle className="h-4 w-4 text-red-500" />;
            case 'medium':
                return <IconAlertTriangle className="h-4 w-4 text-amber-500" />;
            default:
                return <IconCircle className="h-4 w-4 text-emerald-500" />;
        }
    };

    const hasData = scoreData && scoreData.total_events > 0;

    if (!hasData) {
        return (
            <Card className='border border-neutral-800 bg-neutral-900' data-tour="security-score">
                <CardHeader className='pb-2'>
                    <CardTitle className='text-lg font-medium flex items-center'>
                        <IconShieldCheck className='mr-2 h-5 w-5 text-emerald-400' />
                        Security Score
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col items-center justify-center pt-6 pb-8 text-neutral-400'>
                        <div className='text-3xl mb-2'>–</div>
                        <div className='mb-3'>No data available yet</div>
                        <div className='text-xs text-center max-w-xs'>
                            Start forwarding emails for analysis to see your security score!
                        </div>
                        <div className='mt-4 p-3 bg-neutral-800/50 rounded-lg text-xs text-center'>
                            <div className='font-medium text-neutral-200 mb-1'>What is Security Score?</div>
                            <div className='text-neutral-400 text-[10px]'>
                                A 0-100 rating of your email security health based on threat detection,
                                risk levels, and false positives over the last 30 days.
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className='border border-neutral-800 bg-neutral-900' data-tour="security-score">
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium flex items-center'>
                    <IconShieldCheck className='mr-2 h-5 w-5 text-emerald-400' />
                    Security Score
                    <span className='ml-2 group relative'>
                        <IconInfoCircle className='h-4 w-4 text-neutral-500 group-hover:text-neutral-300 cursor-pointer' />
                        <div className='absolute left-6 top-0 z-10 hidden group-hover:block bg-neutral-800 text-xs text-neutral-100 p-3 rounded shadow-lg w-[320px] border border-neutral-700'>
                            <div className='mb-2'>
                                <strong>How is this calculated?</strong>
                            </div>
                            <div className='mb-3 space-y-1 text-[10px]'>
                                <div>• Starts at 100 points</div>
                                <div>• Deducts points for high-risk emails</div>
                                <div>• Penalties for critical threats (-5 each)</div>
                                <div>• Penalties for high threats (-2 each)</div>
                                <div>• Penalties for false positives (-2 each)</div>
                                <div>• Based on last 30 days of activity</div>
                            </div>
                            <div className='text-[10px] font-mono bg-neutral-900 p-2 rounded'>
                                100 - (avg_risk × 0.5) - (false_pos × 2) - (critical × 5) - (high × 2) - (threats × 1.5)
                            </div>
                        </div>
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col items-center justify-center pt-2'>
                    <div className={cn('text-5xl font-bold mb-2', scoreMetadata.color)}>
                        {calculatedScore}
                    </div>

                    <Progress
                        value={calculatedScore || 0}
                        className='h-2 w-full mb-4'
                        indicatorClassName={progressColor}
                    />

                    <div
                        className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium mb-3',
                            scoreMetadata.color.replace('text-', 'bg-').replace('-400', '-400/20').replace('-500', '-500/20'),
                            scoreMetadata.color
                        )}
                    >
                        {scoreMetadata.label}
                    </div>

                    {/* What This Means Section */}
                    <div className='w-full p-3 bg-neutral-800/30 rounded-lg mb-4'>
                        <div className='flex items-center gap-2 mb-2'>
                            {getUrgencyIcon(scoreMetadata.urgency)}
                            <span className='text-xs font-medium text-neutral-200'>
                                What this means:
                            </span>
                        </div>
                        <div className='text-xs text-neutral-400 mb-2'>
                            {scoreMetadata.description}
                        </div>
                        <div className='text-xs text-neutral-300'>
                            <strong>Recommendation:</strong> {scoreMetadata.recommendation}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className='w-full grid grid-cols-2 gap-2 mb-4 text-xs'>
                        <div className='flex justify-between p-2 bg-neutral-800/20 rounded'>
                            <span className='text-neutral-400'>Critical Threats:</span>
                            <span className={scoreData.criticals > 0 ? 'text-red-400 font-medium' : 'text-neutral-300'}>
                                {scoreData.criticals}
                            </span>
                        </div>
                        <div className='flex justify-between p-2 bg-neutral-800/20 rounded'>
                            <span className='text-neutral-400'>High Risk:</span>
                            <span className={scoreData.highs > 0 ? 'text-orange-400 font-medium' : 'text-neutral-300'}>
                                {scoreData.highs}
                            </span>
                        </div>
                        <div className='flex justify-between p-2 bg-neutral-800/20 rounded'>
                            <span className='text-neutral-400'>Total Events:</span>
                            <span className='text-neutral-300'>{scoreData.total_events}</span>
                        </div>
                        <div className='flex justify-between p-2 bg-neutral-800/20 rounded'>
                            <span className='text-neutral-400'>Avg Risk:</span>
                            <span className='text-neutral-300'>{scoreData.avg_risk_score?.toFixed(1) || 0}</span>
                        </div>
                    </div>

                    <div className='text-xs text-neutral-500'>
                        Last updated: {formatDate(scoreData.last_event_at)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
