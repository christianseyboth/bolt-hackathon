'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
    IconClock,
    IconPlus,
    IconEdit,
    IconTrash,
    IconMail,
    IconCalendar
} from '@tabler/icons-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduledReportsProps {
    accountId: string;
    scheduledReports: ScheduledReport[];
}

interface ScheduledReport {
    id: string;
    name: string;
    type: string;
    format: 'pdf' | 'csv' | 'xlsx';
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    is_active: boolean;
    next_run: string;
    created_at: string;
}

// Mock data removed - using real data from props

const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
        case 'daily': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'weekly': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'monthly': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
};

export function ScheduledReports({ accountId, scheduledReports = [] }: ScheduledReportsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
    const { toast } = useToast();

    const [newReport, setNewReport] = useState({
        name: '',
        type: 'security-summary',
        format: 'pdf' as const,
        frequency: 'weekly' as const,
        recipients: '',
    });

    const handleToggleActive = async (reportId: string, isActive: boolean) => {
        try {
            await fetch(`/api/reports/scheduled/${reportId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_active: isActive }),
            });

            toast({
                title: isActive ? 'Report Activated' : 'Report Deactivated',
                description: `Scheduled report has been ${isActive ? 'activated' : 'deactivated'}.`,
            });
        } catch (error) {
            console.error('Error toggling report:', error);
            toast({
                title: 'Error',
                description: 'Failed to update report status.',
                variant: 'destructive',
            });
        }
    };

    const handleCreateReport = async () => {
        try {
            await fetch('/api/reports/scheduled', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newReport,
                    accountId,
                    recipients: newReport.recipients.split(',').map(email => email.trim()),
                }),
            });

            toast({
                title: 'Scheduled Report Created',
                description: 'Your scheduled report has been created successfully.',
            });

            setIsDialogOpen(false);
            setNewReport({
                name: '',
                type: 'security-summary',
                format: 'pdf',
                frequency: 'weekly',
                recipients: '',
            });
        } catch (error) {
            console.error('Error creating report:', error);
            toast({
                title: 'Error',
                description: 'Failed to create scheduled report.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        try {
            await fetch(`/api/reports/scheduled/${reportId}`, {
                method: 'DELETE',
            });

            toast({
                title: 'Report Deleted',
                description: 'Scheduled report has been deleted.',
            });
        } catch (error) {
            console.error('Error deleting report:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete scheduled report.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Card className="border border-neutral-800 bg-neutral-900">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <IconClock className="h-5 w-5 text-orange-400" />
                            Scheduled Reports
                        </CardTitle>
                        <p className="text-sm text-neutral-400">
                            Automate report generation and delivery
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <IconPlus className="h-4 w-4 mr-2" />
                                Add Schedule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-neutral-900 border-neutral-700">
                            <DialogHeader>
                                <DialogTitle>Create Scheduled Report</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Report Name</Label>
                                    <Input
                                        value={newReport.name}
                                        onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Weekly Security Summary"
                                        className="bg-neutral-800 border-neutral-700"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Report Type</Label>
                                        <Select
                                            value={newReport.type}
                                            onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}
                                        >
                                            <SelectTrigger className="bg-neutral-800 border-neutral-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="security-summary">Security Summary</SelectItem>
                                                <SelectItem value="email-analytics">Email Analytics</SelectItem>
                                                <SelectItem value="monthly-report">Monthly Report</SelectItem>
                                                <SelectItem value="team-activity">Team Activity</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Format</Label>
                                        <Select
                                            value={newReport.format}
                                            onValueChange={(value: 'pdf' | 'csv' | 'xlsx') =>
                                                setNewReport(prev => ({ ...prev, format: value }))
                                            }
                                        >
                                            <SelectTrigger className="bg-neutral-800 border-neutral-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pdf">PDF</SelectItem>
                                                <SelectItem value="xlsx">Excel</SelectItem>
                                                <SelectItem value="csv">CSV</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <Select
                                        value={newReport.frequency}
                                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                                            setNewReport(prev => ({ ...prev, frequency: value }))
                                        }
                                    >
                                        <SelectTrigger className="bg-neutral-800 border-neutral-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Recipients (comma separated)</Label>
                                    <Input
                                        value={newReport.recipients}
                                        onChange={(e) => setNewReport(prev => ({ ...prev, recipients: e.target.value }))}
                                        placeholder="admin@company.com, security@company.com"
                                        className="bg-neutral-800 border-neutral-700"
                                    />
                                </div>

                                <Button onClick={handleCreateReport} className="w-full">
                                    Create Scheduled Report
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {scheduledReports.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                        <IconClock className="h-12 w-12 mx-auto mb-3 text-neutral-600" />
                        <p className="text-sm font-medium">No scheduled reports</p>
                        <p className="text-xs">Create automated reports for regular delivery</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scheduledReports.map((report) => (
                            <div
                                key={report.id}
                                className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-700"
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 bg-neutral-700 rounded-lg">
                                        <IconCalendar className="h-4 w-4 text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-medium text-neutral-200 truncate">
                                                {report.name}
                                            </h4>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${getFrequencyColor(report.frequency)}`}
                                            >
                                                {report.frequency}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-neutral-400 mb-2">
                                            <span>{report.format.toUpperCase()}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <IconMail className="h-3 w-3" />
                                                {report.recipients.length} recipient{report.recipients.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            Next run: {new Date(report.next_run).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-4">
                                    <Switch
                                        checked={report.is_active}
                                        onCheckedChange={(checked) => handleToggleActive(report.id, checked)}
                                    />
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingReport(report)}
                                        >
                                            <IconEdit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteReport(report.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <IconTrash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
