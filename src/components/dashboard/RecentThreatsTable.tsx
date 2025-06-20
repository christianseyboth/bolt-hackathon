import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    IconEye,
    IconFilter,
    IconDownload,
    IconAlertTriangle,
    IconShield,
    IconMail,
} from '@tabler/icons-react';

interface ThreatData {
    id: string;
    subject: string;
    sender: string;
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    threatType: string;
    detectedAt: string;
    status: 'blocked' | 'quarantined' | 'flagged';
}

const mockThreats: ThreatData[] = [
    {
        id: '1',
        subject: 'Urgent: Your account will be suspended',
        sender: 'security@fake-bank.com',
        riskLevel: 'critical',
        threatType: 'Phishing',
        detectedAt: '2024-01-15 14:30',
        status: 'blocked',
    },
    {
        id: '2',
        subject: 'Invoice_Final.exe',
        sender: 'billing@suspicious-domain.com',
        riskLevel: 'high',
        threatType: 'Malware',
        detectedAt: '2024-01-15 12:15',
        status: 'quarantined',
    },
    {
        id: '3',
        subject: 'Click here for amazing deals!',
        sender: 'offers@spam-site.net',
        riskLevel: 'medium',
        threatType: 'Spam',
        detectedAt: '2024-01-15 09:45',
        status: 'flagged',
    },
    {
        id: '4',
        subject: 'RE: Meeting tomorrow',
        sender: 'colleague@company.com',
        riskLevel: 'low',
        threatType: 'Suspicious Link',
        detectedAt: '2024-01-15 08:20',
        status: 'flagged',
    },
];

const getRiskColor = (level: string) => {
    switch (level) {
        case 'critical':
            return 'bg-red-500 text-white';
        case 'high':
            return 'bg-orange-500 text-white';
        case 'medium':
            return 'bg-amber-500 text-white';
        case 'low':
            return 'bg-blue-500 text-white';
        default:
            return 'bg-neutral-500 text-white';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'blocked':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'quarantined':
            return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'flagged':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        default:
            return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
};

export const RecentThreatsTable = () => {
    return (
        <Card className='border border-neutral-800 bg-neutral-900'>
            <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                    <CardTitle className='flex items-center gap-2'>
                        <IconShield className='h-5 w-5 text-red-400' />
                        Recent Threats
                    </CardTitle>
                    <div className='flex gap-2'>
                        <Button variant='outline' size='sm'>
                            <IconFilter className='h-4 w-4 mr-1' />
                            Filter
                        </Button>
                        <Button variant='outline' size='sm'>
                            <IconDownload className='h-4 w-4 mr-1' />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {mockThreats.length === 0 ? (
                    <div className='text-center py-8 text-neutral-400'>
                        <IconShield className='h-12 w-12 mx-auto mb-3 text-emerald-400' />
                        <p className='text-sm font-medium'>No threats detected</p>
                        <p className='text-xs'>Your email security is working perfectly!</p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {/* Mobile-friendly list view */}
                        <div className='block md:hidden space-y-3'>
                            {mockThreats.map((threat) => (
                                <div
                                    key={threat.id}
                                    className='p-3 bg-neutral-800/30 rounded-lg border border-neutral-700'
                                >
                                    <div className='flex items-start justify-between mb-2'>
                                        <div className='flex-1 min-w-0'>
                                            <h4 className='text-sm font-medium text-neutral-200 truncate'>
                                                {threat.subject}
                                            </h4>
                                            <p className='text-xs text-neutral-400 truncate'>
                                                {threat.sender}
                                            </p>
                                        </div>
                                        <Badge
                                            className={`ml-2 text-xs ${getRiskColor(
                                                threat.riskLevel
                                            )}`}
                                        >
                                            {threat.riskLevel.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <Badge
                                                variant='outline'
                                                className={`text-xs ${getStatusColor(
                                                    threat.status
                                                )}`}
                                            >
                                                {threat.status}
                                            </Badge>
                                            <span className='text-xs text-neutral-500'>
                                                {threat.threatType}
                                            </span>
                                        </div>
                                        <Button variant='ghost' size='sm'>
                                            <IconEye className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table view */}
                        <div className='hidden md:block'>
                            <div
                                className='overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#525252 #262626',
                                }}
                            >
                                <table className='w-full'>
                                    <thead>
                                        <tr className='border-b border-neutral-700 text-left'>
                                            <th className='pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider'>
                                                Subject
                                            </th>
                                            <th className='pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider'>
                                                Sender
                                            </th>
                                            <th className='pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider'>
                                                Risk Level
                                            </th>
                                            <th className='pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider'>
                                                Type
                                            </th>
                                            <th className='pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider'>
                                                Status
                                            </th>
                                            <th className='pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider'>
                                                Detected
                                            </th>
                                            <th className='pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider'>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className='space-y-2'>
                                        {mockThreats.map((threat, index) => (
                                            <tr
                                                key={threat.id}
                                                className={
                                                    index !== mockThreats.length - 1
                                                        ? 'border-b border-neutral-800'
                                                        : ''
                                                }
                                            >
                                                <td className='py-3 pr-4'>
                                                    <div className='flex items-center gap-2'>
                                                        <IconMail className='h-4 w-4 text-neutral-400 flex-shrink-0' />
                                                        <span
                                                            className='text-sm text-neutral-200 truncate max-w-[200px]'
                                                            title={threat.subject}
                                                        >
                                                            {threat.subject}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className='py-3 pr-4'>
                                                    <span
                                                        className='text-sm text-neutral-400 truncate max-w-[150px]'
                                                        title={threat.sender}
                                                    >
                                                        {threat.sender}
                                                    </span>
                                                </td>
                                                <td className='py-3 pr-4'>
                                                    <Badge
                                                        className={`text-xs ${getRiskColor(
                                                            threat.riskLevel
                                                        )}`}
                                                    >
                                                        {threat.riskLevel.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className='py-3 pr-4'>
                                                    <span className='text-sm text-neutral-300'>
                                                        {threat.threatType}
                                                    </span>
                                                </td>
                                                <td className='py-3 pr-4'>
                                                    <Badge
                                                        variant='outline'
                                                        className={`text-xs ${getStatusColor(
                                                            threat.status
                                                        )}`}
                                                    >
                                                        {threat.status}
                                                    </Badge>
                                                </td>
                                                <td className='py-3 pr-4'>
                                                    <span className='text-sm text-neutral-400'>
                                                        {threat.detectedAt}
                                                    </span>
                                                </td>
                                                <td className='py-3'>
                                                    <Button variant='ghost' size='sm'>
                                                        <IconEye className='h-4 w-4' />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className='flex items-center justify-between pt-3 border-t border-neutral-800'>
                            <span className='text-sm text-neutral-400'>
                                Showing {mockThreats.length} of {mockThreats.length} threats
                            </span>
                            <Button variant='outline' size='sm'>
                                View All Threats
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
