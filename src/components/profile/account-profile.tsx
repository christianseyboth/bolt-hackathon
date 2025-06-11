'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconCheck, IconEdit, IconGavel, IconX, IconCrown } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AccountProfile {
    id: string;
    billing_email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    provider: string;
    plan: string;
    role: string;
    emails_left: number;
    created_at: string;
    updated_at: string;
}

export function AccountProfile() {
    const [account, setAccount] = useState<AccountProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedAccount, setEditedAccount] = useState<Partial<AccountProfile>>({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    // Fetch account data
    useEffect(() => {
        fetchAccount();
    }, []);

    const fetchAccount = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: accountData, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching account:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load account data.',
                });
            } else {
                setAccount(accountData);
                setEditedAccount(accountData);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!account) return;

        setUpdating(true);
        try {
            const { error } = await supabase
                .from('accounts')
                .update({
                    full_name: editedAccount.full_name,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', account.id);

            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to update profile.',
                });
            } else {
                setAccount({ ...account, ...editedAccount });
                setIsEditing(false);
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully.',
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        setEditedAccount(account || {});
        setIsEditing(false);
    };

    const getPlanColor = (plan: string) => {
        switch (plan.toLowerCase()) {
            case 'free': return 'bg-gray-600';
            case 'pro': return 'bg-blue-600';
            case 'enterprise': return 'bg-purple-600';
            default: return 'bg-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-neutral-800 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-neutral-800 rounded w-32"></div>
                        <div className="h-3 bg-neutral-800 rounded w-48"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="text-center py-8">
                <p className="text-neutral-400">No account data found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage
                        src={account.avatar_url ?? undefined}
                        alt={account.full_name ?? ''}
                    />
                    <AvatarFallback className="text-lg">
                        {account.full_name?.[0]?.toUpperCase() ?? account.billing_email?.[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-semibold">{account.full_name || 'Anonymous User'}</h2>
                        <Badge variant="secondary" className="text-xs">
                            {account.provider === 'email' ? 'Email' : `OAuth (${account.provider})`}
                        </Badge>
                        {account.avatar_url && (
                            <Badge variant="default" className="text-xs bg-emerald-600">
                                <IconCheck className="h-3 w-3 mr-1" />
                                Avatar
                            </Badge>
                        )}
                    </div>
                    <p className="text-neutral-400 mb-2">{account.billing_email || 'No email'}</p>
                    <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getPlanColor(account.plan)}`}>
                            {account.plan !== 'free' && <IconCrown className="h-3 w-3 mr-1" />}
                            {account.plan.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-neutral-500">
                            {account.emails_left} emails left
                        </span>
                    </div>
                </div>
                {!isEditing && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                    >
                        <IconEdit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                )}
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            value={isEditing ? editedAccount.full_name || '' : account.full_name || ''}
                            onChange={(e) => setEditedAccount({ ...editedAccount, full_name: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            value={account.billing_email || ''}
                            disabled
                            className="bg-neutral-800/50"
                        />
                        <p className="text-xs text-neutral-400">
                            Email cannot be changed. Contact support if needed.
                        </p>
                    </div>
                </div>

                {account.avatar_url && (
                    <div className="space-y-2">
                        <Label>Profile Avatar</Label>
                        <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-md">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={account.avatar_url} />
                                <AvatarFallback>
                                    {account.full_name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm">
                                    Avatar from {account.provider === 'google' ? 'Google' : account.provider}
                                </p>
                                <p className="text-xs text-neutral-400">
                                    Automatically synced from your OAuth provider
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <Label className="text-neutral-400">Account Created</Label>
                        <p>{new Date(account.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <Label className="text-neutral-400">Last Updated</Label>
                        <p>{new Date(account.updated_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <Label className="text-neutral-400">Plan</Label>
                        <p className="capitalize">{account.plan}</p>
                    </div>
                    <div>
                        <Label className="text-neutral-400">Role</Label>
                        <p className="capitalize">{account.role}</p>
                    </div>
                </div>

                {/* Edit Actions */}
                {isEditing && (
                    <div className="flex gap-2 pt-4">
                        <Button onClick={handleSave} disabled={updating}>
                            {updating ? (
                                <>
                                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <IconGavel className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} disabled={updating}>
                            <IconX className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
