'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
    IconDownload,
    IconFileText,
    IconShield,
    IconMail,
    IconCalendar,
    IconUsers,
    IconLoader2
} from '@tabler/icons-react';

interface QuickReportsProps {
    accountId: string;
}

interface QuickReportTemplate {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    type: 'security' | 'email' | 'activity' | 'summary';
    estimatedTime: string;
    format: 'pdf' | 'csv' | 'xlsx';
}

const quickReportTemplates: QuickReportTemplate[] = [
    {
        id: 'security-summary',
        title: 'Security Summary',
        description: 'Weekly security overview with threat analysis',
        icon: <IconShield className="h-5 w-5" />,
        type: 'security',
        estimatedTime: '< 1 min',
        format: 'pdf'
    },
    {
        id: 'email-analytics',
        title: 'Email Analytics',
        description: 'Email scanning statistics and threat detection',
        icon: <IconMail className="h-5 w-5" />,
        type: 'email',
        estimatedTime: '< 30s',
        format: 'xlsx'
    },
    {
        id: 'monthly-report',
        title: 'Monthly Report',
        description: 'Comprehensive monthly security report',
        icon: <IconCalendar className="h-5 w-5" />,
        type: 'summary',
        estimatedTime: '< 2 min',
        format: 'pdf'
    },
    {
        id: 'team-activity',
        title: 'Team Activity',
        description: 'User activity and security events',
        icon: <IconUsers className="h-5 w-5" />,
        type: 'activity',
        estimatedTime: '< 45s',
        format: 'csv'
    }
];

const getTypeColor = (type: string) => {
    switch (type) {
        case 'security': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'email': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'activity': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'summary': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
};

export function QuickReports({ accountId }: QuickReportsProps) {
    const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const handleGenerateReport = async (template: QuickReportTemplate) => {
        setGeneratingReports(prev => new Set(prev.add(template.id)));

        try {
            const response = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountId,
                    reportType: template.id,
                    format: template.format,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${template.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${template.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            toast({
                title: 'Report Generated',
                description: `${template.title} has been generated and downloaded. Check your report history below.`,
            });
        } catch (error) {
            console.error('Error generating report:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate report. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setGeneratingReports(prev => {
                const next = new Set(prev);
                next.delete(template.id);
                return next;
            });
        }
    };

    return (
        <Card className="border border-neutral-800 bg-neutral-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconFileText className="h-5 w-5 text-blue-400" />
                    Quick Reports
                </CardTitle>
                <p className="text-sm text-neutral-400">
                    Generate pre-configured reports instantly
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {quickReportTemplates.map((template) => {
                    const isGenerating = generatingReports.has(template.id);

                    return (
                        <div
                            key={template.id}
                            className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-700"
                        >
                            <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-neutral-700 rounded-lg">
                                    {template.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-medium text-neutral-200">
                                            {template.title}
                                        </h4>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${getTypeColor(template.type)}`}
                                        >
                                            {template.type}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-neutral-400 mb-2">
                                        {template.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                                        <span>Format: {template.format.toUpperCase()}</span>
                                        <span>•</span>
                                        <span>{template.estimatedTime}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateReport(template)}
                                disabled={isGenerating}
                                className="ml-4"
                            >
                                {isGenerating ? (
                                    <IconLoader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <IconDownload className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
