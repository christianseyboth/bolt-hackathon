'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import {
    IconSettings,
    IconDownload,
    IconLoader2,
    IconCalendar,
    IconFileText,
    IconDatabase,
} from '@tabler/icons-react';
import { addDays } from 'date-fns';

interface ReportsGenerationProps {
    accountId: string;
}

interface ReportConfig {
    dateRange: {
        from: Date;
        to: Date;
    };
    format: 'pdf' | 'csv' | 'xlsx' | 'json';
    sections: {
        emailAnalytics: boolean;
        securitySummary: boolean;
        threatDetails: boolean;
        userActivity: boolean;
        complianceMetrics: boolean;
    };
    filters: {
        riskLevel: string;
        threatType: string;
        status: string;
    };
}

const defaultConfig: ReportConfig = {
    dateRange: {
        from: addDays(new Date(), -30),
        to: new Date(),
    },
    format: 'pdf',
    sections: {
        emailAnalytics: true,
        securitySummary: true,
        threatDetails: false,
        userActivity: false,
        complianceMetrics: false,
    },
    filters: {
        riskLevel: 'all',
        threatType: 'all',
        status: 'all',
    },
};

export function ReportsGeneration({ accountId }: ReportsGenerationProps) {
    const [config, setConfig] = useState<ReportConfig>(defaultConfig);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const updateConfig = (path: string, value: any) => {
        setConfig((prev) => {
            const keys = path.split('.');
            const newConfig = { ...prev };
            let current: any = newConfig;

            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newConfig;
        });
    };

    const generateCustomReport = async () => {
        setIsGenerating(true);

        try {
            const response = await fetch('/api/reports/generate-custom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountId,
                    config,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate custom report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Custom_Report_${new Date().toISOString().split('T')[0]}.${config.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            toast({
                title: 'Custom Report Generated',
                description:
                    'Your custom report has been generated and downloaded. Check your report history below.',
            });
        } catch (error) {
            console.error('Error generating custom report:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate custom report. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className='border border-neutral-800 bg-neutral-900'>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <IconSettings className='h-5 w-5 text-green-400' />
                    Custom Report Builder
                </CardTitle>
                <p className='text-sm text-neutral-400'>
                    Create customized reports with specific filters and sections
                </p>
            </CardHeader>
            <CardContent className='space-y-6'>
                {/* Date Range Selection */}
                <div className='space-y-2'>
                    <Label className='text-sm font-medium text-neutral-200 flex items-center gap-2'>
                        <IconCalendar className='h-4 w-4' />
                        Date Range
                    </Label>
                    <DateRangePicker
                        date={config.dateRange}
                        setDate={(dateRange) => {
                            if (dateRange?.from && dateRange?.to) {
                                updateConfig('dateRange', {
                                    from: dateRange.from,
                                    to: dateRange.to,
                                });
                            }
                        }}
                    />
                </div>

                <Separator className='bg-neutral-700' />

                {/* Format Selection */}
                <div className='space-y-2'>
                    <Label className='text-sm font-medium text-neutral-200 flex items-center gap-2'>
                        <IconFileText className='h-4 w-4' />
                        Export Format
                    </Label>
                    <Select
                        value={config.format}
                        onValueChange={(value) => updateConfig('format', value)}
                    >
                        <SelectTrigger className='bg-neutral-800 border-neutral-700'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='pdf'>PDF - Formatted Report</SelectItem>
                            <SelectItem value='xlsx'>Excel - Spreadsheet</SelectItem>
                            <SelectItem value='csv'>CSV - Data Export</SelectItem>
                            <SelectItem value='json'>JSON - Raw Data</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Separator className='bg-neutral-700' />

                {/* Report Sections */}
                <div className='space-y-3'>
                    <Label className='text-sm font-medium text-neutral-200 flex items-center gap-2'>
                        <IconDatabase className='h-4 w-4' />
                        Report Sections
                    </Label>
                    <div className='space-y-3'>
                        {Object.entries(config.sections).map(([key, value]) => (
                            <div key={key} className='flex items-center justify-between'>
                                <div className='space-y-0.5'>
                                    <div className='text-sm text-neutral-200'>
                                        {key
                                            .replace(/([A-Z])/g, ' $1')
                                            .replace(/^./, (str) => str.toUpperCase())}
                                    </div>
                                    <div className='text-xs text-neutral-400'>
                                        {getSectionDescription(key)}
                                    </div>
                                </div>
                                <Switch
                                    checked={value}
                                    onCheckedChange={(checked) =>
                                        updateConfig(`sections.${key}`, checked)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className='bg-neutral-700' />

                {/* Filters */}
                <div className='space-y-3'>
                    <Label className='text-sm font-medium text-neutral-200'>Filters</Label>
                    <div className='grid grid-cols-1 gap-3'>
                        <div className='space-y-2'>
                            <Label className='text-xs text-neutral-400'>Risk Level</Label>
                            <Select
                                value={config.filters.riskLevel}
                                onValueChange={(value) => updateConfig('filters.riskLevel', value)}
                            >
                                <SelectTrigger className='bg-neutral-800 border-neutral-700'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>All Risk Levels</SelectItem>
                                    <SelectItem value='critical'>Critical Only</SelectItem>
                                    <SelectItem value='high'>High & Above</SelectItem>
                                    <SelectItem value='medium'>Medium & Above</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-xs text-neutral-400'>Threat Type</Label>
                            <Select
                                value={config.filters.threatType}
                                onValueChange={(value) => updateConfig('filters.threatType', value)}
                            >
                                <SelectTrigger className='bg-neutral-800 border-neutral-700'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>All Types</SelectItem>
                                    <SelectItem value='phishing'>Phishing</SelectItem>
                                    <SelectItem value='malware'>Malware</SelectItem>
                                    <SelectItem value='spam'>Spam</SelectItem>
                                    <SelectItem value='suspicious'>Suspicious Links</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Separator className='bg-neutral-700' />

                {/* Generate Button */}
                <Button className='w-full' onClick={generateCustomReport} disabled={isGenerating}>
                    {isGenerating ? (
                        <IconLoader2 className='h-4 w-4 mr-2 animate-spin' />
                    ) : (
                        <IconDownload className='h-4 w-4 mr-2' />
                    )}
                    Generate Custom Report
                </Button>
            </CardContent>
        </Card>
    );
}

function getSectionDescription(key: string): string {
    const descriptions: Record<string, string> = {
        emailAnalytics: 'Email scanning statistics and trends',
        securitySummary: 'Overall security posture summary',
        threatDetails: 'Detailed threat analysis and incidents',
        userActivity: 'User actions and system interactions',
        complianceMetrics: 'Compliance scores and requirements',
    };
    return descriptions[key] || '';
}
