'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export function RiskiestSenders({ riskiestSenders }: any) {
    // Mock data for riskiest senders/domains

    const getRiskBadge = (score: number) => {
        const baseClasses = 'text-xs font-medium';

        if (score >= 90)
            return <Badge className={`bg-red-900/40 text-red-400 ${baseClasses}`}>Critical</Badge>;
        if (score >= 75)
            return <Badge className={`bg-red-900/30 text-red-400 ${baseClasses}`}>High</Badge>;
        if (score >= 60)
            return (
                <Badge className={`bg-amber-900/30 text-amber-400 ${baseClasses}`}>Medium</Badge>
            );
        return <Badge className={`bg-yellow-900/30 text-yellow-400 ${baseClasses}`}>Low</Badge>;
    };

    const getCategoryBadge = (category: string) => {
        const baseClasses = 'text-xs font-medium';

        switch (category.toLowerCase()) {
            case 'phishing':
                return (
                    <Badge className={`bg-purple-900/30 text-purple-400 ${baseClasses}`}>
                        {category}
                    </Badge>
                );
            case 'malware':
                return (
                    <Badge className={`bg-red-900/30 text-red-400 ${baseClasses}`}>
                        {category}
                    </Badge>
                );
            case 'spam':
                return (
                    <Badge className={`bg-blue-900/30 text-blue-400 ${baseClasses}`}>
                        {category}
                    </Badge>
                );
            case 'scam':
                return (
                    <Badge className={`bg-orange-900/30 text-orange-400 ${baseClasses}`}>
                        {category}
                    </Badge>
                );
            default:
                return (
                    <Badge className={`bg-neutral-900/30 text-neutral-400 ${baseClasses}`}>
                        {category}
                    </Badge>
                );
        }
    };

    return (
        <Card className='border-neutral-800 bg-neutral-900'>
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg font-medium'>
                    Top 10 Riskiest Senders/Domains
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[40%]'>Domain</TableHead>
                            <TableHead className='text-center'>Emails</TableHead>
                            <TableHead className='text-center'>Risk Score</TableHead>
                            <TableHead className='text-right'>Category</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {riskiestSenders.length > 0 ? (
                            riskiestSenders.map((sender: any) => (
                                <TableRow key={sender.rownum}>
                                    <TableCell className='font-medium'>{sender.domain}</TableCell>
                                    <TableCell className='text-center'>
                                        {sender.emails_sent}
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='flex items-center justify-center'>
                                            <div className='mr-2'>{sender.riskScore}</div>
                                            {getRiskBadge(sender.riskScore)}
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        {getCategoryBadge(sender.category)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className='text-center text-neutral-500 py-8'
                                >
                                    No risky senders detected yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
