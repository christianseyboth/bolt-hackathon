'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/Dialog';
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
    AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { useToast } from '@/components/ui/use-toast';
import {
    IconKey,
    IconPlus,
    IconCopy,
    IconEye,
    IconEyeOff,
    IconTrash,
    IconEdit,
    IconCalendar,
    IconShield,
    IconActivity,
} from '@tabler/icons-react';
import {
    createApiKey,
    listApiKeys,
    revokeApiKey,
    updateApiKeyName,
    type ApiKey,
} from '@/app/api-keys/actions';
import { SubscriptionAccessGate } from '@/components/dashboard/SubscriptionAccessGate';
import { createClient } from '@/utils/supabase/client';

export function ApiKeyManagement() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
    const [newKeyExpiry, setNewKeyExpiry] = useState<string>('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
    const [showNewKey, setShowNewKey] = useState(false);
    const [subscriptionAccess, setSubscriptionAccess] = useState<{
        hasApiAccess: boolean;
        planName: string;
    } | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchApiKeys();
        checkSubscriptionAccess();
    }, []);

    const checkSubscriptionAccess = async () => {
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            // Get user's account
            const { data: account } = await supabase
                .from('accounts')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!account) return;

            // Get current active subscription
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('plan_name, subscription_status')
                .eq('account_id', account.id)
                .eq('subscription_status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const planName = subscription?.plan_name || 'Free';
            const isFreePlan = planName === 'Free';

            // API access rules: Free plans have access, Solo/Entrepreneur don't, Team does
            let hasApiAccess = true; // Free plans can access all features

            if (!isFreePlan) {
                switch (planName) {
                    case 'Solo':
                    case 'Entrepreneur':
                        hasApiAccess = false;
                        break;
                    case 'Team':
                        hasApiAccess = true;
                        break;
                    default:
                        hasApiAccess = false;
                }
            }

            setSubscriptionAccess({
                hasApiAccess,
                planName,
            });
        } catch (error) {
            console.error('Error checking subscription access:', error);
        }
    };

    const fetchApiKeys = async () => {
        setLoading(true);
        try {
            const result = await listApiKeys();
            if (result.success && result.keys) {
                setApiKeys(result.keys);
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to fetch API keys',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error fetching API keys:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch API keys',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApiKey = async () => {
        if (!newKeyName.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a name for your API key',
                variant: 'destructive',
            });
            return;
        }

        setCreating(true);
        try {
            const result = await createApiKey(
                newKeyName.trim(),
                newKeyPermissions,
                newKeyExpiry || undefined
            );

            if (result.success && result.apiKey) {
                setNewlyCreatedKey(result.apiKey);
                setShowNewKey(true);
                setNewKeyName('');
                setNewKeyPermissions(['read']);
                setNewKeyExpiry('');
                setShowCreateDialog(false);
                await fetchApiKeys();

                toast({
                    title: 'Success',
                    description: 'API key created successfully',
                });
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to create API key',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error creating API key:', error);
            toast({
                title: 'Error',
                description: 'Failed to create API key',
                variant: 'destructive',
            });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteApiKey = async (keyId: string, keyName: string) => {
        try {
            const result = await revokeApiKey(keyId);
            if (result.success) {
                await fetchApiKeys();
                toast({
                    title: 'Success',
                    description: `API key "${keyName}" has been permanently deleted`,
                });
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to delete API key',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error deleting API key:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete API key',
                variant: 'destructive',
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied to clipboard',
            description: 'API key copied to clipboard',
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getPermissionBadgeColor = (permission: string) => {
        switch (permission) {
            case 'read':
                return 'bg-blue-500/20 text-blue-400';
            case 'write':
                return 'bg-green-500/20 text-green-400';
            case 'admin':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (loading) {
        return (
            <Card className='border border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <IconKey className='h-5 w-5' />
                        API Keys
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='animate-pulse space-y-4'>
                        <div className='h-10 bg-neutral-800 rounded'></div>
                        <div className='h-20 bg-neutral-800 rounded'></div>
                        <div className='h-20 bg-neutral-800 rounded'></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show access gate if user doesn't have API access
    if (subscriptionAccess && !subscriptionAccess.hasApiAccess) {
        return (
            <Card className='border border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <IconKey className='h-5 w-5' />
                        API Keys
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <SubscriptionAccessGate
                        feature='api'
                        currentPlan={subscriptionAccess.planName}
                        requiredPlan='Team'
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className='border border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2'>
                            <IconKey className='h-5 w-5' />
                            API Keys
                        </CardTitle>
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button size='sm'>
                                    <IconPlus className='h-4 w-4 mr-2' />
                                    Create API Key
                                </Button>
                            </DialogTrigger>
                            <DialogContent className='bg-neutral-900 border-neutral-800'>
                                <DialogHeader>
                                    <DialogTitle>Create New API Key</DialogTitle>
                                    <DialogDescription>
                                        Create a new API key to access SecPilot programmatically.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className='space-y-4'>
                                    <div>
                                        <Label htmlFor='keyName'>Key Name</Label>
                                        <Input
                                            id='keyName'
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            placeholder='e.g., Production API, Development Key'
                                            className='mt-1'
                                        />
                                    </div>
                                    <div>
                                        <Label>Permissions</Label>
                                        <Select
                                            value={newKeyPermissions[0] || 'read'}
                                            onValueChange={(value) => setNewKeyPermissions([value])}
                                        >
                                            <SelectTrigger className='mt-1'>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='read'>Read Only</SelectItem>
                                                <SelectItem value='write'>Read & Write</SelectItem>
                                                <SelectItem value='admin'>Full Access</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor='expiry'>Expiry Date (Optional)</Label>
                                        <Input
                                            id='expiry'
                                            type='date'
                                            value={newKeyExpiry}
                                            onChange={(e) => setNewKeyExpiry(e.target.value)}
                                            className='mt-1'
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant='outline'
                                        onClick={() => setShowCreateDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateApiKey} disabled={creating}>
                                        {creating ? 'Creating...' : 'Create API Key'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {apiKeys.length === 0 ? (
                        <div className='text-center py-8'>
                            <IconKey className='h-12 w-12 text-neutral-600 mx-auto mb-4' />
                            <h3 className='text-lg font-medium text-neutral-300 mb-2'>
                                No API Keys
                            </h3>
                            <p className='text-neutral-500 mb-4'>
                                Create your first API key to start using SecPilot programmatically.
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {apiKeys.map((key) => (
                                <div
                                    key={key.id}
                                    className='p-4 border border-neutral-800 rounded-lg bg-neutral-800/50'
                                >
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <div className='flex items-center gap-3 mb-2'>
                                                <h4 className='font-medium text-neutral-200'>
                                                    {key.name}
                                                </h4>
                                            </div>

                                            <div className='flex items-center gap-2 mb-3'>
                                                <code className='text-sm bg-neutral-700 px-2 py-1 rounded font-mono'>
                                                    {key.key_prefix}
                                                </code>
                                                <span className='text-xs text-neutral-500 ml-2'>
                                                    (Full key hidden for security)
                                                </span>
                                            </div>

                                            <div className='flex flex-wrap gap-2 mb-3'>
                                                {key.permissions.map((permission) => (
                                                    <Badge
                                                        key={permission}
                                                        className={`text-xs ${getPermissionBadgeColor(permission)}`}
                                                    >
                                                        <IconShield className='h-3 w-3 mr-1' />
                                                        {permission}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className='text-xs text-neutral-500 space-y-1'>
                                                <div className='flex items-center gap-2'>
                                                    <IconCalendar className='h-3 w-3' />
                                                    Created: {formatDate(key.created_at)}
                                                </div>
                                                {key.last_used_at && (
                                                    <div className='flex items-center gap-2'>
                                                        <IconActivity className='h-3 w-3' />
                                                        Last used: {formatDate(key.last_used_at)}
                                                    </div>
                                                )}
                                                {key.expires_at && (
                                                    <div className='flex items-center gap-2'>
                                                        <IconCalendar className='h-3 w-3' />
                                                        Expires: {formatDate(key.expires_at)}
                                                    </div>
                                                )}
                                                <div>Rate limit: {key.rate_limit} req/hour</div>
                                            </div>
                                        </div>

                                        <div className='flex gap-2'>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant='outline' size='sm'>
                                                        <IconTrash className='h-4 w-4' />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className='bg-neutral-900 border-neutral-800'>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Delete API Key
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to permanently
                                                            delete the API key "{key.name}"? This
                                                            action cannot be undone and will
                                                            immediately stop all requests using this
                                                            key.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDeleteApiKey(key.id, key.name)
                                                            }
                                                            className='bg-red-600 hover:bg-red-700'
                                                        >
                                                            Delete Key
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Show newly created API key */}
            <Dialog open={showNewKey} onOpenChange={setShowNewKey}>
                <DialogContent className='bg-neutral-900 border-neutral-800'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <IconKey className='h-5 w-5' />
                            API Key Created Successfully
                        </DialogTitle>
                        <DialogDescription>
                            Your API key has been created. Copy it now as it won't be shown again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div className='p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg'>
                            <div className='flex items-center gap-2 mb-2'>
                                <IconShield className='h-4 w-4 text-amber-400' />
                                <span className='text-sm font-medium text-amber-400'>
                                    Security Notice
                                </span>
                            </div>
                            <p className='text-sm text-neutral-300'>
                                Store this API key securely. You won't be able to see it again after
                                closing this dialog.
                            </p>
                        </div>

                        <div>
                            <Label>Your API Key</Label>
                            <div className='flex gap-2 mt-1'>
                                <Input
                                    value={newlyCreatedKey || ''}
                                    readOnly
                                    className='font-mono text-sm'
                                />
                                <Button
                                    variant='outline'
                                    onClick={() => copyToClipboard(newlyCreatedKey || '')}
                                >
                                    <IconCopy className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => {
                                setShowNewKey(false);
                                setNewlyCreatedKey(null);
                            }}
                        >
                            I've Saved the Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
