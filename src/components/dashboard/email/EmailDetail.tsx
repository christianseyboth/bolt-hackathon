'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    IconAlertOctagon,
    IconAlertTriangle,
    IconLink,
    IconShieldCheck,
    IconAlertHexagon,
} from '@tabler/icons-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

export interface EmailAnalysisData {
    id: string;
    sender: string;
    subject: string;
    receivedAt: string;
    summary: {
        text: string;
        threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
        category?: string;
        recommendation: string;
    };
    contentAnalysis: {
        randomTextPattern?: boolean;
        legitimateLinks?: boolean;
        suspiciousImage?: boolean;
        suspiciousElements: string[];
    };
    urlAnalysis?: {
        urls: Array<{
            url: string;
            description: string;
            risk: 'low' | 'medium' | 'high' | 'critical';
        }>;
    };
    attachmentRisk: 'none' | 'low' | 'medium' | 'high';
    emailContent: string;
    attachments?: Array<{
        name: string;
        type: string;
        risk: 'low' | 'medium' | 'high' | 'critical';
        scanResult?: string;
    }>;
}

export function EmailDetail({ mail }: any) {
    const data = mail.ai_analysis;

    function capitalize(str: string) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const getThreatLevelColor = (level: string) => {
        switch (capitalize(level)) {
            case 'Critical':
                return 'bg-red-900/40 text-red-400 border-red-800';
            case 'High':
                return 'bg-red-900/30 text-red-400 border-red-800';
            case 'Medium':
                return 'bg-amber-900/30 text-amber-400 border-amber-800';
            case 'Low':
                return 'bg-yellow-900/30 text-yellow-400 border-yellow-800';
            default:
                return 'bg-emerald-900/30 text-emerald-400 border-emerald-800';
        }
    };

    const getThreatLevelIcon = (level: string) => {
        switch (capitalize(level)) {
            case 'Critical':
                return <IconAlertOctagon className='h-5 w-5 mr-2' />;
            case 'High':
                return <IconAlertOctagon className='h-5 w-5 mr-2' />;
            case 'medium':
                return <IconAlertTriangle className='h-5 w-5 mr-2' />;
            default:
                return <IconShieldCheck className='h-5 w-5 mr-2' />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const newLocal = 'bg-red-800 text-neutral-300';
    return (
        <div className='space-y-6'>
            {/* Header Section */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardContent className='p-6'>
                    <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
                        <div>
                            <h2 className='text-xl font-semibold mb-1'>{mail.subject}</h2>
                            <p className='text-sm text-neutral-400'>From: {mail.sender_email}</p>
                            <p className='text-sm text-neutral-400'>
                                Received: {formatDate(mail.created_at)}
                            </p>
                        </div>

                        <div
                            className={cn(
                                'px-4 py-2 rounded-lg flex items-center',
                                getThreatLevelColor(data.threat_level)
                            )}
                        >
                            {getThreatLevelIcon(data.threat_level)}
                            <div>
                                <div className='font-semibold flex items-center'>
                                    {capitalize(data.threat_level)} Threat Level
                                </div>
                                {data.category && (
                                    <div className='text-xs'>Category: {data.category}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Section */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Summary</CardTitle>

                    <div className='flex items-center gap-2 mt-1'>
                        Risk Score: <RiskBadge score={data.risk_score} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <p>{data.summary}</p>

                        <div className='bg-neutral-800 rounded-lg p-4'>
                            <h4 className='font-medium mb-2'>Recommendation</h4>

                            <ul className='space-y-2'>
                                {data.recommendation.map((element: any, idx: number) => (
                                    <li
                                        key={idx}
                                        className='bg-neutral-800/50 p-3 rounded-md text-sm'
                                    >
                                        <span className='flex'>
                                            {' '}
                                            <IconAlertHexagon className='h-5 w-5 mr-2 text-orange-500' />
                                            {element}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader className='pb-3'>
                    <CardTitle className='text-lg'>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='content'>
                        <TabsList className='grid w-full grid-cols-3 mb-4'>
                            <TabsTrigger value='content'>Content Analysis</TabsTrigger>
                            <TabsTrigger value='urls'>URLs & Links</TabsTrigger>
                            <TabsTrigger value='reasoning'>Reasoning</TabsTrigger>
                        </TabsList>

                        <TabsContent value='content' className='space-y-4'>
                            <div className='space-y-4'>
                                <h3 className='font-medium text-base'>Content Flags</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {data.details.content_analysis.random_text_pattern && (
                                        <div className='flex items-start space-x-2 bg-neutral-800/50 p-3 rounded-md'>
                                            <Badge className='bg-red-900/20 text-red-400 h-5'>
                                                Flag
                                            </Badge>
                                            <p className='text-sm'>
                                                {data.details.content_analysis.random_text_pattern}
                                            </p>
                                        </div>
                                    )}

                                    {data.details.content_analysis.legitimate_looking_links && (
                                        <div className='flex items-start space-x-2 bg-neutral-800/50 p-3 rounded-md'>
                                            <Badge className='bg-red-900/20 text-red-400 h-5'>
                                                Flag
                                            </Badge>
                                            <p className='text-sm'>
                                                {
                                                    data.details.content_analysis
                                                        .legitimate_looking_links
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {data.details.content_analysis.suspicious_image && (
                                        <div className='flex items-start space-x-2 bg-neutral-800/50 p-3 rounded-md'>
                                            <Badge className='bg-amber-900/20 text-amber-400 h-5'>
                                                Flag
                                            </Badge>
                                            <p className='text-sm'>
                                                {data.details.content_analysis.suspicious_image}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <h3 className='font-medium text-base mt-6'>Suspicious Elements</h3>
                                <ul className='space-y-2'>
                                    {data.details.suspicious_elements.map(
                                        (element: any, idx: number) => (
                                            <li
                                                key={idx}
                                                className='bg-neutral-800/50 p-3 rounded-md text-sm'
                                            >
                                                {element}
                                            </li>
                                        )
                                    )}
                                </ul>

                                {data.details.attachment_risk && (
                                    <>
                                        <h3 className='font-medium text-base mt-6'>Attachments</h3>
                                        <ul className='space-y-2'>
                                            <li className='bg-neutral-800/50 p-3 rounded-md text-sm'>
                                                {data.details.attachment_risk}
                                            </li>
                                        </ul>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value='urls'>
                            {mail.links && mail.links.length > 0 ? (
                                <div className='space-y-4'>
                                    <h3 className='font-medium text-base'>Detected URLs</h3>
                                    <div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className='w-1/2'>URL</TableHead>
                                                    {/* <TableHead>Recommendation</TableHead> */}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mail.links.map((url: string, idx: number) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className='font-medium'>
                                                            <div className='flex items-center'>
                                                                <IconLink className='h-4 w-4 mr-2 text-neutral-400' />
                                                                <span className='text-sm truncate max-w-[250px]'>
                                                                    {url}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        {/* <TableCell>
                                                            <Badge className={newLocal}>
                                                                <IconAlertOctagon className='mr-2' />{' '}
                                                                Do not click
                                                            </Badge>
                                                        </TableCell> */}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className='my-8'>
                                            <h3 className='font-medium text-base'>
                                                Recommendation:
                                            </h3>
                                            <div className='overflow-auto mt-4'>
                                                {data.details.url_analysis &&
                                                    data.details.url_analysis.length > 0 && (
                                                        <ul className='space-y-2'>
                                                            {data.details.url_analysis.map(
                                                                (element: any, idx: number) => (
                                                                    <li
                                                                        key={idx}
                                                                        className='bg-neutral-800/50 p-3 rounded-md text-sm'
                                                                    >
                                                                        <span className='flex'>
                                                                            {' '}
                                                                            <IconAlertHexagon className='h-5 w-5 mr-2 text-orange-500' />
                                                                            {element}
                                                                        </span>
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='py-10 text-center text-neutral-400'>
                                    No URLs or suspicious links detected in this email.
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value='reasoning'>
                            <div className='space-y-4'>
                                <div className='bg-neutral-800/50 p-4 rounded-md'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <div className='text-sm font-medium'>Reasoning</div>
                                        <Badge className='bg-neutral-700 text-neutral-300'>
                                            AI Analysis
                                        </Badge>
                                    </div>
                                    <div className='bg-neutral-900 p-4 rounded-md border border-neutral-700 font-mono text-xs whitespace-pre-wrap max-h-[400px] overflow-y-auto'>
                                        {data.reasoning || 'No reasoning available.'}
                                    </div>
                                </div>
                                {mail.links && mail.links.length > 0 ? (
                                    <div className='space-y-4'>
                                        <div className='overflow-auto'>
                                            <div className='my-2'>
                                                <h3 className='font-medium text-base'>
                                                    References:
                                                </h3>
                                                <div className='overflow-auto mt-4'>
                                                    {data.references &&
                                                        data.references.length > 0 && (
                                                            <ul className='space-y-2'>
                                                                {data.references.map(
                                                                    (element: any, idx: number) => (
                                                                        <li
                                                                            key={idx}
                                                                            className='bg-neutral-800/50 p-3 rounded-md text-sm'
                                                                        >
                                                                            <span className='flex'>
                                                                                {' '}
                                                                                <IconAlertHexagon className='h-5 w-5 mr-2 text-orange-500' />
                                                                                {element}
                                                                            </span>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='py-10 text-center text-neutral-400'>
                                        No URLs or suspicious links detected in this email.
                                    </div>
                                )}
                                <p className='text-xs text-neutral-500 italic'>
                                    Note: Suspicious elements in the email may be highlighted in a
                                    different color. Always exercise caution when interacting with
                                    suspicious emails.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function RiskBadge({ score }: { score: number }) {
    let color = 'bg-emerald-900/30 text-emerald-400';
    let label = 'Low';
    if (score >= 85) {
        color = 'bg-red-900/40 text-red-400';
        label = 'Critical';
    } else if (score >= 70) {
        color = 'bg-red-900/30 text-red-400';
        label = 'High';
    } else if (score >= 55) {
        color = 'bg-amber-900/30 text-amber-400';
        label = 'Medium';
    }
    return (
        <Badge className={cn('px-2 py-1 rounded-full text-xs font-semibold', color)}>
            {label} ({score})
        </Badge>
    );
}
