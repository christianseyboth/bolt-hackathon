'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    IconTrash,
    IconAlertTriangle,
    IconDownload,
    IconShield,
    IconCalendar,
    IconCreditCard,
    IconKey,
} from '@tabler/icons-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { deleteAccount, getAccountData, exportAccountData } from '@/app/account/actions';
import { createClient } from '@/utils/supabase/client';

interface AccountData {
    createdAt: string;
    plan: string;
    emailsUsed: number;
    apiKeysCount: number;
    hasActiveSubscription: boolean;
}

export function DeleteAccountSection() {
    const router = useRouter();
    const { toast } = useToast();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDataDialog, setShowDataDialog] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        setLoading(true);
        try {
            const result = await getAccountData();
            if (result.success && result.data) {
                setAccountData(result.data);
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to load account data',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error fetching account data:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (data: any, filename: string) => {
        try {
            // Create JSON string with proper formatting
            const jsonString = JSON.stringify(data, null, 2);

            // Create blob with explicit encoding
            const blob = new Blob([jsonString], {
                type: 'application/json;charset=utf-8',
            });

            // Create download URL
            const url = URL.createObjectURL(blob);

            // Create temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error downloading file:', error);
            return false;
        }
    };

    // Fallback client-side export
    const exportDataClientSide = async () => {
        try {
            const supabase = createClient();

            // Get current user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error('Authentication required');
            }

            // Get account data
            const { data: account, error: accountError } = await supabase
                .from('accounts')
                .select(
                    `
          *,
          subscriptions (*),
          api_keys (
            id,
            name,
            permissions,
            created_at,
            last_used_at,
            is_active
          )
        `
                )
                .eq('owner_id', user.id)
                .single();

            if (accountError || !account) {
                console.error('Account not found:', accountError);
                return {
                    success: false,
                    error: 'Account data is not available. Please try refreshing the page or contact support.',
                };
            }

            // Prepare export data
            const exportData = {
                account: {
                    id: account.id,
                    plan: account.subscriptions?.[0]?.plan_name || 'Free', // Get plan from latest subscription
                    billing_email: account.billing_email || user.email,
                    created_at: account.created_at,
                    updated_at: account.updated_at,
                    full_name: account.full_name || 'Not provided',
                    role: account.role || 'user',
                    emails_left: account.subscriptions?.[0]?.emails_left || 0, // Get emails from subscription
                    avatar_url: account.avatar_url,
                    provider: account.provider,
                },
                user: {
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at,
                    last_sign_in_at: user.last_sign_in_at,
                    provider: user.app_metadata?.provider,
                    email_verified: user.email_confirmed_at !== null,
                },
                subscriptions: (account.subscriptions || []).map((sub: any) => ({
                    id: sub.id,
                    plan_name: sub.plan_name,
                    subscription_status: sub.subscription_status,
                    created_at: sub.created_at,
                    current_period_start: sub.current_period_start,
                    current_period_end: sub.current_period_end,
                    emails_left: sub.emails_left,
                    stripe_subscription_id: sub.stripe_subscription_id,
                })),
                api_keys: (account.api_keys || []).map((key: any) => ({
                    id: key.id,
                    name: key.name,
                    permissions: key.permissions,
                    created_at: key.created_at,
                    last_used_at: key.last_used_at,
                    is_active: key.is_active,
                })),
                metadata: {
                    export_version: '1.0',
                    exported_at: new Date().toISOString(),
                    total_subscriptions: (account.subscriptions || []).length,
                    total_api_keys: (account.api_keys || []).length,
                    export_method: 'client-side',
                },
            };

            return { success: true, data: exportData };
        } catch (error) {
            console.error('Client-side export error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    };

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            console.log('Starting data export...');

            // Try server action first
            let result = await exportAccountData();
            console.log('Server export result:', result);

            // If server action fails, try client-side export
            if (!result.success) {
                console.log('Server export failed, trying client-side...');
                result = await exportDataClientSide();
                console.log('Client-side export result:', result);
            }

            if (result.success && result.data) {
                // Generate filename with current date
                const today = new Date().toISOString().split('T')[0];
                const filename = `proactiv-account-data-${today}.json`;

                console.log('Attempting to download file:', filename);

                // Attempt to download the file
                const downloadSuccess = downloadFile(result.data, filename);

                if (downloadSuccess) {
                    toast({
                        title: 'Data exported',
                        description: 'Your account data has been downloaded successfully.',
                    });
                    setShowDataDialog(false);
                } else {
                    throw new Error('Download failed');
                }
            } else {
                console.error('Export failed:', result.error);
                toast({
                    title: 'Export failed',
                    description: result.error || 'Failed to export account data',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            toast({
                title: 'Export failed',
                description: 'An error occurred while exporting your data. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        if (confirmationText !== 'DELETE') {
            toast({
                title: 'Invalid confirmation',
                description: 'Please type "DELETE" to confirm',
                variant: 'destructive',
            });
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteAccount(confirmationText);

            if (result.success) {
                // Close the dialog
                setShowDeleteDialog(false);

                // Show success toast
                toast({
                    title: 'Account deleted',
                    description: 'Your account has been deleted successfully.',
                });

                // Redirect to home page after a brief delay
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                toast({
                    title: 'Deletion failed',
                    description: result.error || 'Failed to delete account',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            toast({
                title: 'Deletion failed',
                description: 'An error occurred while deleting your account',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isConfirmationValid = confirmationText === 'DELETE';

    return (
        <Card className='border-neutral-800 bg-neutral-900'>
            <CardHeader className='pb-3'>
                <div className='flex items-center space-x-2'>
                    <div className='bg-neutral-800 p-2 rounded-md'>
                        <IconTrash className='h-5 w-5 text-red-500' />
                    </div>
                    <div>
                        <CardTitle className='text-lg'>Delete Account</CardTitle>
                        <CardDescription>
                            Permanently delete your account and all associated data
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-6'>
                {/* Account Summary */}
                {!loading && accountData && (
                    <div className='bg-neutral-800/50 p-4 rounded-lg space-y-3'>
                        <h4 className='font-medium text-neutral-200 mb-3'>Account Overview</h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                            <div className='flex items-center gap-2'>
                                <IconCalendar className='h-4 w-4 text-neutral-400' />
                                <span className='text-neutral-400'>Created:</span>
                                <span>{formatDate(accountData.createdAt)}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <IconCreditCard className='h-4 w-4 text-neutral-400' />
                                <span className='text-neutral-400'>Plan:</span>
                                <Badge variant='secondary'>{accountData.plan}</Badge>
                            </div>
                            <div className='flex items-center gap-2'>
                                <IconShield className='h-4 w-4 text-neutral-400' />
                                <span className='text-neutral-400'>Emails processed:</span>
                                <span>{accountData.emailsUsed}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <IconKey className='h-4 w-4 text-neutral-400' />
                                <span className='text-neutral-400'>API keys:</span>
                                <span>{accountData.apiKeysCount}</span>
                            </div>
                        </div>
                        {accountData.hasActiveSubscription && (
                            <div className='pt-2 border-t border-neutral-700'>
                                <Badge variant='default' className='bg-orange-600'>
                                    Active Subscription
                                </Badge>
                                <p className='text-xs text-neutral-400 mt-1'>
                                    You have an active subscription. Canceling will stop future
                                    billing.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Warning */}
                <div className='bg-red-950/20 border border-red-900/30 text-red-400 px-4 py-3 rounded-md flex items-start'>
                    <IconAlertTriangle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
                    <div className='text-sm'>
                        <p className='font-medium mb-1'>Warning: This action cannot be undone</p>
                        <p>
                            Once you delete your account, all of your data will be permanently
                            removed:
                        </p>
                        <ul className='list-disc list-inside mt-2 space-y-1 text-xs'>
                            <li>All email scan results and security reports</li>
                            <li>API keys and their usage history</li>
                            <li>Account settings and preferences</li>
                            <li>Billing and subscription information</li>
                            <li>Profile information and authentication data</li>
                        </ul>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-3'>
                    <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='order-2 sm:order-1'>
                                <IconDownload className='h-4 w-4 mr-2' />
                                Export My Data
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='bg-neutral-900 border-neutral-800'>
                            <DialogHeader>
                                <DialogTitle>Export Account Data</DialogTitle>
                                <DialogDescription>
                                    Download a copy of all your account data before deletion.
                                </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                                <div className='bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg'>
                                    <h4 className='font-medium text-blue-400 mb-2'>
                                        What's included:
                                    </h4>
                                    <ul className='text-sm text-neutral-300 space-y-1'>
                                        <li>• Account information and settings</li>
                                        <li>• API keys and permissions (without secrets)</li>
                                        <li>• Subscription and billing history</li>
                                        <li>• Usage statistics and metadata</li>
                                    </ul>
                                </div>
                                <p className='text-sm text-neutral-400'>
                                    Your data will be exported as a JSON file. Sensitive information
                                    like API key secrets are excluded for security.
                                </p>
                            </div>
                            <DialogFooter>
                                <Button variant='outline' onClick={() => setShowDataDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleExportData} disabled={isExporting}>
                                    {isExporting ? 'Exporting...' : 'Download Data'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant='destructive'
                        className='bg-red-600 hover:bg-red-700 order-1 sm:order-2'
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <IconTrash className='h-4 w-4 mr-2' />
                        Delete Account
                    </Button>
                </div>
            </CardContent>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className='bg-neutral-900 border-neutral-800'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center gap-2'>
                            <IconAlertTriangle className='h-5 w-5 text-red-500' />
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className='space-y-3'>
                            <span className='block'>
                                This action cannot be undone. This will permanently delete your
                                account and remove all your data from our servers.
                            </span>
                            {accountData?.hasActiveSubscription && (
                                <span className='block bg-orange-950/20 border border-orange-900/30 p-3 rounded'>
                                    <span className='text-orange-400 text-sm font-medium'>
                                        ⚠️ You have an active subscription that will be cancelled
                                        immediately.
                                    </span>
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className='py-4'>
                        <Label htmlFor='confirmation' className='text-sm font-medium'>
                            Type{' '}
                            <code className='bg-neutral-800 px-1 rounded text-red-400'>DELETE</code>{' '}
                            to confirm:
                        </Label>
                        <Input
                            id='confirmation'
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder='Type DELETE here'
                            className='mt-2'
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setConfirmationText('');
                                setShowDeleteDialog(false);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={!isConfirmationValid || isDeleting}
                            className='bg-red-600 hover:bg-red-700 text-white'
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
