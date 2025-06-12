'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/components/ui/use-toast';
import {
    IconHistory,
    IconDownload,
    IconTrash,
    IconFileText,
    IconCalendar,
    IconFileTypeCsv,
    IconFileTypePdf,
    IconFileTypeXls,
    IconChevronLeft,
    IconChevronRight,
    IconSearch,
    IconLoader2
} from '@tabler/icons-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ReportHistoryProps {
    accountId: string | null;
    initialReports?: ReportHistoryItem[];
}

interface ReportHistoryItem {
    id: string;
    name: string;
    type: string;
    format: 'pdf' | 'csv' | 'xlsx' | 'json';
    size: string;
    created_at: string;
    status: 'completed' | 'failed' | 'generating';
    download_url?: string;
}

const ITEMS_PER_PAGE = 5;

const getFormatIcon = (format: string) => {
    switch (format) {
        case 'pdf': return <IconFileTypePdf className="h-4 w-4 text-red-400" />;
        case 'csv': return <IconFileTypeCsv className="h-4 w-4 text-green-400" />;
        case 'xlsx': return <IconFileTypeXls className="h-4 w-4 text-blue-400" />;
        default: return <IconFileText className="h-4 w-4 text-neutral-400" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'generating': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
};

export function ReportHistory({ accountId, initialReports = [] }: ReportHistoryProps) {
    const { toast } = useToast();
    const supabase = createClient();

    const [reports, setReports] = useState<ReportHistoryItem[]>(initialReports);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredReports, setFilteredReports] = useState<ReportHistoryItem[]>([]);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; reportId: string; reportName: string }>({
        isOpen: false,
        reportId: '',
        reportName: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    // Function to refresh reports data
    const refreshReports = async () => {
        if (!accountId) {
            setReports([]);
            return;
        }

        setLoading(true);
        try {
            const { data: reportHistoryData, error } = await supabase
                .from('report_history')
                .select('*')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false });

            if (!error) {
                setReports(reportHistoryData || []);
            }
        } catch (error) {
            console.warn('Failed to refresh reports:', error);
        } finally {
            setLoading(false);
        }
    };

    // Set up Supabase realtime subscription
    useEffect(() => {
        if (!accountId) return;

        const channel = supabase
            .channel('report_history_changes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'report_history',
                filter: `account_id=eq.${accountId}`
            }, (payload) => {
                console.log('New report generated:', payload.new);

                // Add new report to the beginning of the list
                setReports(prev => [payload.new as ReportHistoryItem, ...prev]);

                toast({
                    title: 'New Report Available',
                    description: `${payload.new.name} has been added to your history.`,
                });
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'report_history',
                filter: `account_id=eq.${accountId}`
            }, (payload) => {
                console.log('Report deleted via realtime:', payload.old);

                // Remove deleted report from the list
                setReports(prev => prev.filter(report => report.id !== payload.old.id));
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'report_history',
                filter: `account_id=eq.${accountId}`
            }, (payload) => {
                console.log('Report updated:', payload.new);

                // Update the specific report in the list
                setReports(prev => prev.map(report =>
                    report.id === payload.new.id ? payload.new as ReportHistoryItem : report
                ));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [accountId]);

    // Filter reports based on search term
    useEffect(() => {
        const filtered = reports.filter(report =>
            report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.format.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredReports(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [reports, searchTerm]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentReports = filteredReports.slice(startIndex, endIndex);

    const handleDownload = async (report: ReportHistoryItem) => {
        setIsDownloading(report.id);
        try {
            const response = await fetch(`/api/reports/download/${report.id}`);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${report.name.replace(/\s+/g, '_')}.${report.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: 'Download Complete',
                description: `${report.name} has been downloaded successfully.`,
            });
        } catch (error) {
            console.error('Download error:', error);
            toast({
                title: 'Download Failed',
                description: 'Failed to download report. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsDownloading(null);
        }
    };

    const handleDeleteClick = (report: ReportHistoryItem) => {
        setDeleteModal({
            isOpen: true,
            reportId: report.id,
            reportName: report.name
        });
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const reportName = deleteModal.reportName;
        const reportId = deleteModal.reportId;

        try {
            const response = await fetch(`/api/reports/${reportId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete report');
            }

            // Close modal immediately
            setDeleteModal({ isOpen: false, reportId: '', reportName: '' });

            // Show success toast
            toast({
                title: 'Report Deleted',
                description: `${reportName} has been deleted successfully.`,
            });

            // Optimistic update - remove from list immediately
            // Realtime will sync this change but this provides instant feedback
            setReports(prev => prev.filter(report => report.id !== reportId));

        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: 'Delete Failed',
                description: error.message || 'Failed to delete report. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <>
            <Card className="border border-neutral-800 bg-neutral-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconHistory className="h-5 w-5 text-purple-400" />
                        Report History
                        {loading && (
                            <IconLoader2 className="h-4 w-4 animate-spin text-neutral-400" />
                        )}
                    </CardTitle>
                    <p className="text-sm text-neutral-400">
                        Download and manage your previously generated reports
                    </p>

                    {/* Search Bar */}
                    {reports.length > 0 && (
                        <div className="relative">
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-400"
                            />
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {reports.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400">
                            <IconFileText className="h-12 w-12 mx-auto mb-3 text-neutral-600" />
                            <p className="text-sm font-medium">No reports generated yet</p>
                            <p className="text-xs">Your report history will appear here</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400">
                            <IconSearch className="h-12 w-12 mx-auto mb-3 text-neutral-600" />
                            <p className="text-sm font-medium">No reports match your search</p>
                            <p className="text-xs">Try adjusting your search terms</p>
                        </div>
                    ) : (
                        <>
                            {/* Reports List */}
                            <div className="space-y-3">
                                {currentReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-700"
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="p-2 bg-neutral-700 rounded-lg">
                                                {getFormatIcon(report.format)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-medium text-neutral-200 truncate">
                                                        {report.name}
                                                    </h4>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${getStatusColor(report.status)}`}
                                                    >
                                                        {report.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                    <span className="flex items-center gap-1">
                                                        <IconCalendar className="h-3 w-3" />
                                                        <span title={format(new Date(report.created_at), 'PPpp')}>
                                                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                                        </span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>{report.format.toUpperCase()}</span>
                                                    <span>•</span>
                                                    <span>{report.size}</span>
                                                </div>
                                                <div className="text-xs text-neutral-500 mt-1">
                                                    Created: {format(new Date(report.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            {report.status === 'completed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(report)}
                                                    disabled={isDownloading === report.id}
                                                    className="min-w-[40px]"
                                                >
                                                    {isDownloading === report.id ? (
                                                        <IconLoader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <IconDownload className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteClick(report)}
                                                disabled={isDeleting}
                                                className="text-red-400 hover:text-red-300 hover:border-red-500/50 min-w-[40px]"
                                            >
                                                {isDeleting && deleteModal.reportId === report.id ? (
                                                    <IconLoader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <IconTrash className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800">
                                    <div className="text-sm text-neutral-400">
                                        Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length} reports
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="bg-neutral-800 border-neutral-700"
                                        >
                                            <IconChevronLeft className="h-4 w-4" />
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    size="sm"
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    onClick={() => handlePageChange(page)}
                                                    className={
                                                        currentPage === page
                                                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                                                            : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
                                                    }
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="bg-neutral-800 border-neutral-700"
                                        >
                                            <IconChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, reportId: '', reportName: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Report"
                description={`Are you sure you want to delete "${deleteModal.reportName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </>
    );
}
