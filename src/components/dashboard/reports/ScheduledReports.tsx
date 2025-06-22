'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/utils/supabase/client';
import {
    IconClock,
    IconPlus,
    IconEdit,
    IconTrash,
    IconMail,
    IconCalendar,
} from '@tabler/icons-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/Select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/AlertDialog';

interface ScheduledReportsProps {
    accountId: string | null;
    initialScheduledReports?: ScheduledReport[];
}

interface ScheduledReport {
    id: string;
    account_id: string;
    name: string;
    type: string;
    format: 'pdf' | 'csv' | 'xlsx';
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    is_active: boolean;
    next_run: string;
    created_at: string;
}

interface DeleteModal {
    isOpen: boolean;
    reportId: string;
    reportName: string;
}

const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
        case 'daily':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'weekly':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'monthly':
            return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        default:
            return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
};

export function ScheduledReports({
    accountId,
    initialScheduledReports = [],
}: ScheduledReportsProps) {
    const [reports, setReports] = useState<ScheduledReport[]>(initialScheduledReports);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
    const [deleteModal, setDeleteModal] = useState<DeleteModal>({
        isOpen: false,
        reportId: '',
        reportName: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const supabase = createClient();

    const [newReport, setNewReport] = useState<{
        name: string;
        type: string;
        format: 'pdf' | 'csv' | 'xlsx';
        frequency: 'daily' | 'weekly' | 'monthly';
        recipients: string;
    }>({
        name: '',
        type: 'security-summary',
        format: 'pdf',
        frequency: 'weekly',
        recipients: '',
    });

    // Realtime subscription for scheduled reports
    useEffect(() => {
        if (!accountId) return;

        console.log(
            'Setting up realtime subscription for scheduled reports, accountId:',
            accountId
        );

        const channel = supabase
            .channel('scheduled_reports_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'scheduled_reports',
                    filter: `account_id=eq.${accountId}`,
                },
                (payload) => {
                    console.log('New scheduled report added via realtime:', payload.new);
                    setReports((prev) => [payload.new as ScheduledReport, ...prev]);

                    toast({
                        title: 'New Scheduled Report',
                        description: `${payload.new.name} has been scheduled successfully.`,
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'scheduled_reports',
                    filter: `account_id=eq.${accountId}`,
                },
                (payload) => {
                    console.log('Scheduled report deleted via realtime:', payload.old);
                    setReports((prev) => prev.filter((report) => report.id !== payload.old.id));
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'scheduled_reports',
                    filter: `account_id=eq.${accountId}`,
                },
                (payload) => {
                    console.log('Scheduled report updated via realtime:', payload.new);
                    setReports((prev) =>
                        prev.map((report) =>
                            report.id === payload.new.id ? (payload.new as ScheduledReport) : report
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            console.log('Cleaning up scheduled reports realtime subscription');
            supabase.removeChannel(channel);
        };
    }, [accountId]);

    const handleToggleActive = async (report: ScheduledReport, isActive: boolean) => {
        console.log(`Toggling report ${report.id} to ${isActive ? 'active' : 'inactive'}`);

        // Optimistic update
        setReports((prev) =>
            prev.map((r) => (r.id === report.id ? { ...r, is_active: isActive } : r))
        );

        try {
            const url = `/api/reports/scheduled/${report.id}`;
            console.log('Making PATCH request to:', url);
            console.log('Request body:', { is_active: isActive });

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_active: isActive }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                console.log('Response not ok, trying to get error details...');
                let errorMessage = 'Failed to update report status';
                try {
                    const errorData = await response.json();
                    console.log('Error response data:', errorData);
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                    // Provide more helpful error messages
                    if (response.status === 404) {
                        errorMessage = 'API route not found. Make sure the server is running.';
                    } else if (response.status === 500) {
                        errorMessage = 'Server error. Check if database migrations have been run.';
                    }
                }
                throw new Error(errorMessage);
            }

            toast({
                title: isActive ? 'Report Activated' : 'Report Deactivated',
                description: `${report.name} has been ${isActive ? 'activated' : 'deactivated'}.`,
            });
        } catch (error) {
            console.error('Error toggling report:', error);

            // Revert optimistic update
            setReports((prev) =>
                prev.map((r) => (r.id === report.id ? { ...r, is_active: !isActive } : r))
            );

            toast({
                title: 'Error',
                description:
                    error instanceof Error ? error.message : 'Failed to update report status.',
                variant: 'destructive',
            });
        }
    };

    const resetForm = () => {
        setNewReport({
            name: '',
            type: 'security-summary',
            format: 'pdf',
            frequency: 'weekly',
            recipients: '',
        });
        setEditingReport(null);
    };

    const handleCreateReport = async () => {
        if (!newReport.name.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a report name.',
                variant: 'destructive',
            });
            return;
        }

        if (!newReport.recipients.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter at least one recipient email.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const url = editingReport
                ? `/api/reports/scheduled/${editingReport.id}`
                : '/api/reports/scheduled';

            const method = editingReport ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    editingReport
                        ? {
                              name: newReport.name,
                              type: newReport.type,
                              format: newReport.format,
                              frequency: newReport.frequency,
                              recipients: newReport.recipients
                                  .split(',')
                                  .map((email) => email.trim()),
                          }
                        : {
                              ...newReport,
                              accountId,
                              recipients: newReport.recipients
                                  .split(',')
                                  .map((email) => email.trim()),
                          }
                ),
            });

            if (!response.ok) {
                let errorMessage = `Failed to ${editingReport ? 'update' : 'create'} scheduled report`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            toast({
                title: editingReport ? 'Report Updated' : 'Scheduled Report Created',
                description: `Your scheduled report has been ${editingReport ? 'updated' : 'created'} successfully.`,
            });

            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error creating/updating report:', error);
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : `Failed to ${editingReport ? 'update' : 'create'} scheduled report.`,
                variant: 'destructive',
            });
        }
    };

    const handleEditReport = (report: ScheduledReport) => {
        setEditingReport(report);
        setNewReport({
            name: report.name,
            type: report.type,
            format: report.format,
            frequency: report.frequency,
            recipients: report.recipients.join(', '),
        });
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (report: ScheduledReport) => {
        setDeleteModal({
            isOpen: true,
            reportId: report.id,
            reportName: report.name,
        });
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const reportName = deleteModal.reportName;
        const reportId = deleteModal.reportId;

        try {
            const response = await fetch(`/api/reports/scheduled/${reportId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                let errorMessage = 'Failed to delete scheduled report';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Close modal immediately
            setDeleteModal({ isOpen: false, reportId: '', reportName: '' });

            toast({
                title: 'Report Deleted',
                description: `${reportName} has been deleted successfully.`,
            });

            // Optimistic update - realtime will also sync this
            setReports((prev) => prev.filter((report) => report.id !== reportId));
        } catch (error) {
            console.error('Error deleting report:', error);
            toast({
                title: 'Error',
                description:
                    error instanceof Error ? error.message : 'Failed to delete scheduled report.',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Card className='border border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle className='flex items-center gap-2'>
                                <IconClock className='h-5 w-5 text-orange-400' />
                                Scheduled Reports
                            </CardTitle>
                            <p className='text-sm text-neutral-400'>
                                Automate report generation and delivery
                            </p>
                        </div>
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={(open) => {
                                setIsDialogOpen(open);
                                if (!open) {
                                    resetForm();
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button size='sm' variant='outline'>
                                    <IconPlus className='h-4 w-4 mr-2' />
                                    Add Schedule
                                </Button>
                            </DialogTrigger>
                            <DialogContent className='bg-neutral-900 border-neutral-700'>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingReport
                                            ? 'Edit Scheduled Report'
                                            : 'Create Scheduled Report'}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label>Report Name</Label>
                                        <Input
                                            value={newReport.name}
                                            onChange={(e) =>
                                                setNewReport((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            placeholder='Weekly Security Summary'
                                            className='bg-neutral-800 border-neutral-700'
                                        />
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='space-y-2'>
                                            <Label>Report Type</Label>
                                            <Select
                                                value={newReport.type}
                                                onValueChange={(value) =>
                                                    setNewReport((prev) => ({
                                                        ...prev,
                                                        type: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger className='bg-neutral-800 border-neutral-700'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='security-summary'>
                                                        Security Summary
                                                    </SelectItem>
                                                    <SelectItem value='email-analytics'>
                                                        Email Analytics
                                                    </SelectItem>
                                                    <SelectItem value='monthly-report'>
                                                        Monthly Report
                                                    </SelectItem>
                                                    <SelectItem value='team-activity'>
                                                        Team Activity
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className='space-y-2'>
                                            <Label>Format</Label>
                                            <Select
                                                value={newReport.format}
                                                onValueChange={(value: 'pdf' | 'csv' | 'xlsx') =>
                                                    setNewReport((prev) => ({
                                                        ...prev,
                                                        format: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger className='bg-neutral-800 border-neutral-700'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='pdf'>PDF</SelectItem>
                                                    <SelectItem value='xlsx'>Excel</SelectItem>
                                                    <SelectItem value='csv'>CSV</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <Label>Frequency</Label>
                                        <Select
                                            value={newReport.frequency}
                                            onValueChange={(
                                                value: 'daily' | 'weekly' | 'monthly'
                                            ) =>
                                                setNewReport((prev) => ({
                                                    ...prev,
                                                    frequency: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger className='bg-neutral-800 border-neutral-700'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='daily'>Daily</SelectItem>
                                                <SelectItem value='weekly'>Weekly</SelectItem>
                                                <SelectItem value='monthly'>Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='space-y-2'>
                                        <Label>Recipients (comma separated)</Label>
                                        <Input
                                            value={newReport.recipients}
                                            onChange={(e) =>
                                                setNewReport((prev) => ({
                                                    ...prev,
                                                    recipients: e.target.value,
                                                }))
                                            }
                                            placeholder='admin@company.com, security@company.com'
                                            className='bg-neutral-800 border-neutral-700'
                                        />
                                    </div>

                                    <Button onClick={handleCreateReport} className='w-full'>
                                        {editingReport
                                            ? 'Update Scheduled Report'
                                            : 'Create Scheduled Report'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {reports.length === 0 ? (
                        <div className='text-center py-8 text-neutral-400'>
                            <IconClock className='h-12 w-12 mx-auto mb-3 text-neutral-600' />
                            <p className='text-sm font-medium'>No scheduled reports</p>
                            <p className='text-xs'>Create automated reports for regular delivery</p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className='flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-700'
                                >
                                    <div className='flex items-start gap-3 flex-1'>
                                        <div className='p-2 bg-neutral-700 rounded-lg'>
                                            <IconCalendar className='h-4 w-4 text-orange-400' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <h4 className='text-sm font-medium text-neutral-200 truncate'>
                                                    {report.name}
                                                </h4>
                                                <Badge
                                                    variant='outline'
                                                    className={`text-xs ${getFrequencyColor(report.frequency)}`}
                                                >
                                                    {report.frequency}
                                                </Badge>
                                                {!report.is_active && (
                                                    <Badge
                                                        variant='outline'
                                                        className='text-xs bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
                                                    >
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className='flex items-center gap-3 text-xs text-neutral-400 mb-2'>
                                                <span>{report.format.toUpperCase()}</span>
                                                <span>•</span>
                                                <span className='flex items-center gap-1'>
                                                    <IconMail className='h-3 w-3' />
                                                    {report.recipients.length} recipient
                                                    {report.recipients.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className='text-xs text-neutral-500'>
                                                Next run:{' '}
                                                {new Date(report.next_run).toLocaleDateString()} at{' '}
                                                {new Date(report.next_run).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-3 ml-4'>
                                        <Switch
                                            checked={report.is_active}
                                            onCheckedChange={(checked) =>
                                                handleToggleActive(report, checked)
                                            }
                                        />
                                        <div className='flex items-center gap-1'>
                                            <Button
                                                size='sm'
                                                variant='ghost'
                                                onClick={() => handleEditReport(report)}
                                            >
                                                <IconEdit className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                size='sm'
                                                variant='ghost'
                                                onClick={() => handleDeleteClick(report)}
                                                className='text-red-400 hover:text-red-300'
                                            >
                                                <IconTrash className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            <AlertDialog
                open={deleteModal.isOpen}
                onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, isOpen: open }))}
            >
                <AlertDialogContent className='bg-neutral-900 border-neutral-700'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-neutral-200'>
                            Delete Scheduled Report
                        </AlertDialogTitle>
                        <AlertDialogDescription className='text-neutral-400'>
                            Are you sure you want to delete "{deleteModal.reportName}"? This action
                            cannot be undone and will stop all future automated reports.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className='bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                            disabled={isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className='bg-red-600 text-white hover:bg-red-700'
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Report'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
