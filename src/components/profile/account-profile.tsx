'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    IconCheck,
    IconEdit,
    IconDeviceFloppy,
    IconX,
    IconCrown,
    IconCamera,
    IconUser,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AccountProfile {
    id: string;
    billing_email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    provider: string;
    role: string;
    created_at: string;
    updated_at: string;
    // Company billing fields
    company_name: string | null;
    company_address_line1: string | null;
    company_address_line2: string | null;
    company_city: string | null;
    company_state: string | null;
    company_postal_code: string | null;
    company_country: string | null;
    company_tax_id: string | null;
    billing_type: 'individual' | 'business';
    vat_number: string | null;
    // Subscription data (from subscriptions table)
    plan_name?: string;
    emails_left?: number;
    subscription_status?: string;
}

export function AccountProfile() {
    const [account, setAccount] = useState<AccountProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedAccount, setEditedAccount] = useState<Partial<AccountProfile>>({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const { toast } = useToast();

    // Fetch account data
    useEffect(() => {
        fetchAccount();
    }, []);

    const fetchAccount = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch account data
            const { data: accountData, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching account:', error);

                // More specific error handling
                if (error.code === 'PGRST116') {
                    // No account found - this is expected for new users
                    console.log('No account found for user, this may be expected for new users');
                    toast({
                        variant: 'default',
                        title: 'Account Setup',
                        description:
                            'Your account is being set up. Please try refreshing the page in a moment.',
                    });
                } else {
                    // Other database errors
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Failed to load account data. Please try refreshing the page.',
                    });
                }
                setLoading(false);
                return;
            }

            // Fetch subscription data
            const { data: subscriptionData, error: subscriptionError } = await supabase
                .from('subscriptions')
                .select('plan_name, emails_left, subscription_status')
                .eq('account_id', accountData.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (subscriptionError) {
                console.log('No subscription found, using defaults:', subscriptionError);
            }

            // Combine account and subscription data
            const combinedData = {
                ...accountData,
                plan_name: subscriptionData?.plan_name || 'Free',
                emails_left: subscriptionData?.emails_left || 0,
                subscription_status: subscriptionData?.subscription_status || 'active',
            };

            setAccount(combinedData);
            setEditedAccount(combinedData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type - only png, jpg, jpeg
            const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
            if (!allowedTypes.includes(file.type)) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid file type',
                    description: 'Please select a PNG, JPG, or JPEG image.',
                });
                return;
            }

            // Validate file size (max 1MB as per bucket settings)
            if (file.size > 1024 * 1024) {
                toast({
                    variant: 'destructive',
                    title: 'File too large',
                    description: 'Please select an image smaller than 1MB.',
                });
                return;
            }

            setAvatarFile(file);

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const deleteOldAvatar = async (avatarUrl: string) => {
        try {
            // Extract filename from URL
            const urlParts = avatarUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];

            const { error } = await supabase.storage.from('avatars').remove([fileName]);

            if (error) {
                console.error('Error deleting old avatar:', error);
            } else {
                console.log('Old avatar deleted successfully:', fileName);
            }
        } catch (error) {
            console.error('Error deleting old avatar:', error);
        }
    };

    const uploadAvatar = async () => {
        if (!avatarFile || !account) return null;

        setUploadingAvatar(true);
        try {
            console.log('🔄 Starting avatar upload for file:', avatarFile.name);

            // Delete old avatar if exists
            if (account.avatar_url) {
                console.log('🗑️ Deleting old avatar:', account.avatar_url);
                await deleteOldAvatar(account.avatar_url);
            }

            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `avatar-${account.id}-${Date.now()}.${fileExt}`;
            console.log('📁 Generated filename:', fileName);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                console.error('❌ Upload error:', uploadError);
                throw uploadError;
            }

            console.log('✅ Upload successful:', uploadData);

            const {
                data: { publicUrl },
            } = supabase.storage.from('avatars').getPublicUrl(fileName);

            console.log('🔗 Generated public URL:', publicUrl);
            return publicUrl;
        } catch (error) {
            console.error('❌ Error uploading avatar:', error);
            toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: 'Failed to upload avatar. Please try again.',
            });
            return null;
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        if (!account) return;

        setUpdating(true);
        try {
            let avatarUrl = editedAccount.avatar_url;

            // Upload new avatar if one was selected
            if (avatarFile) {
                const newAvatarUrl = await uploadAvatar();
                if (newAvatarUrl) {
                    avatarUrl = newAvatarUrl;
                }
            }

            const { error } = await supabase
                .from('accounts')
                .update({
                    full_name: editedAccount.full_name,
                    avatar_url: avatarUrl,
                    billing_type: editedAccount.billing_type,
                    company_name: editedAccount.company_name,
                    company_address_line1: editedAccount.company_address_line1,
                    company_address_line2: editedAccount.company_address_line2,
                    company_city: editedAccount.company_city,
                    company_state: editedAccount.company_state,
                    company_postal_code: editedAccount.company_postal_code,
                    company_country: editedAccount.company_country,
                    company_tax_id: editedAccount.company_tax_id,
                    vat_number: editedAccount.vat_number,
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
                const updatedAccount = {
                    ...account,
                    ...editedAccount,
                    avatar_url: avatarUrl || null,
                };
                setAccount(updatedAccount);
                setEditedAccount(updatedAccount);
                setIsEditing(false);
                setAvatarFile(null);
                setPreviewUrl(null);

                // Check if billing information was updated
                const billingFieldsChanged =
                    editedAccount.billing_type !== account.billing_type ||
                    editedAccount.company_name !== account.company_name ||
                    editedAccount.company_address_line1 !== account.company_address_line1 ||
                    editedAccount.company_city !== account.company_city ||
                    editedAccount.company_state !== account.company_state ||
                    editedAccount.company_postal_code !== account.company_postal_code ||
                    editedAccount.company_country !== account.company_country ||
                    editedAccount.company_tax_id !== account.company_tax_id ||
                    editedAccount.vat_number !== account.vat_number;

                if (billingFieldsChanged) {
                    // Sync billing info with Stripe in the background
                    fetch('/api/stripe/sync-billing-info', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            accountId: account.id,
                        }),
                    })
                        .then((response) => {
                            if (response.ok) {
                                console.log('✅ Billing info synced with Stripe');
                            } else {
                                console.warn('⚠️ Profile saved but Stripe sync failed');
                            }
                        })
                        .catch((syncError) => {
                            console.error('❌ Stripe sync error:', syncError);
                        });

                    toast({
                        title: 'Success',
                        description: 'Profile and billing information updated successfully.',
                    });
                } else {
                    toast({
                        title: 'Success',
                        description: 'Profile updated successfully.',
                    });
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!account?.avatar_url) return;

        setUpdating(true);
        try {
            // Delete from storage
            await deleteOldAvatar(account.avatar_url);

            // Update database to remove avatar_url
            const { error } = await supabase
                .from('accounts')
                .update({
                    avatar_url: null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', account.id);

            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to delete avatar.',
                });
            } else {
                const updatedAccount = { ...account, avatar_url: null };
                setAccount(updatedAccount);
                setEditedAccount(updatedAccount);
                toast({
                    title: 'Success',
                    description: 'Avatar deleted successfully.',
                });
            }
        } catch (error) {
            console.error('Error deleting avatar:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete avatar.',
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        setEditedAccount(account || {});
        setIsEditing(false);
        setAvatarFile(null);
        setPreviewUrl(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    };

    const getPlanColor = (plan?: string) => {
        if (!plan) return 'bg-gray-600';

        switch (plan.toLowerCase()) {
            case 'free':
                return 'bg-gray-600';
            case 'solo':
                return 'bg-blue-600';
            case 'entrepreneur':
                return 'bg-purple-600';
            case 'team':
                return 'bg-emerald-600';
            case 'pro':
                return 'bg-blue-600';
            case 'enterprise':
                return 'bg-purple-600';
            default:
                return 'bg-gray-600';
        }
    };

    const handleAvatarClick = () => {
        if (account?.provider === 'email' && isEditing) {
            fileInputRef.current?.click();
        }
    };

    if (loading) {
        return (
            <div className='animate-pulse space-y-4'>
                <div className='flex items-center space-x-4'>
                    <div className='h-16 w-16 bg-neutral-800 rounded-full'></div>
                    <div className='space-y-2'>
                        <div className='h-4 bg-neutral-800 rounded w-32'></div>
                        <div className='h-3 bg-neutral-800 rounded w-48'></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className='text-center py-8 text-neutral-400'>
                <IconUser className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Unable to load account information</p>
                <p className='text-sm mt-2'>Your account may still be setting up</p>
                <Button variant='outline' onClick={fetchAccount} className='mt-4'>
                    <IconEdit className='h-4 w-4 mr-2' />
                    Retry
                </Button>
            </div>
        );
    }

    const displayAvatarUrl = previewUrl || account.avatar_url;
    const canEditAvatar = account.provider === 'email';

    // Debug logging for avatar issues
    console.log('🔍 Avatar Debug:', {
        account_avatar_url: account.avatar_url,
        displayAvatarUrl,
        previewUrl,
        provider: account.provider,
        canEditAvatar,
    });

    return (
        <div className='space-y-6'>
            {/* Profile Header */}
            <div className='flex items-center space-x-4'>
                <div className='relative'>
                    <Avatar
                        className={`h-16 w-16 ${canEditAvatar && isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                        onClick={handleAvatarClick}
                    >
                        <AvatarImage
                            src={displayAvatarUrl ?? undefined}
                            alt={account.full_name ?? ''}
                            onError={(e) => {
                                console.error('❌ Avatar image failed to load:', displayAvatarUrl);
                                console.error('Error details:', e);
                            }}
                            onLoad={() => {
                                console.log(
                                    '✅ Avatar image loaded successfully:',
                                    displayAvatarUrl
                                );
                            }}
                        />
                        <AvatarFallback className='text-lg'>
                            {account.full_name?.[0]?.toUpperCase() ??
                                account.billing_email?.[0]?.toUpperCase() ??
                                'U'}
                        </AvatarFallback>
                    </Avatar>

                    {canEditAvatar && isEditing && (
                        <div
                            className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity'
                            onClick={handleAvatarClick}
                        >
                            <IconCamera className='h-4 w-4 text-white' />
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/png,image/jpg,image/jpeg'
                        onChange={handleAvatarFileChange}
                        className='hidden'
                    />
                </div>
                <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                        <h2 className='text-xl font-semibold'>
                            {account.full_name || 'Anonymous User'}
                        </h2>
                        <Badge variant='secondary' className='text-xs'>
                            {account.provider === 'email' ? 'Email' : `OAuth (${account.provider})`}
                        </Badge>
                        {displayAvatarUrl && (
                            <Badge variant='default' className='text-xs bg-emerald-600'>
                                <IconCheck className='h-3 w-3 mr-1' />
                                Avatar
                            </Badge>
                        )}
                    </div>
                    <p className='text-neutral-400 mb-2'>{account.billing_email || 'No email'}</p>
                    <div className='flex items-center gap-2'>
                        <Badge className={`text-xs ${getPlanColor(account.plan_name)}`}>
                            {account.plan_name !== 'Free' && <IconCrown className='h-3 w-3 mr-1' />}
                            {(account.plan_name || 'Free').toUpperCase()}
                        </Badge>
                        <span className='text-xs text-neutral-500'>
                            {account.emails_left || 0} emails left
                        </span>
                    </div>
                    {canEditAvatar && (
                        <p className='text-xs text-neutral-400 mt-1'>
                            {isEditing
                                ? 'Click avatar to upload new photo (PNG/JPG/JPEG, max 1MB)'
                                : 'Click Edit to change avatar'}
                        </p>
                    )}
                    {canEditAvatar && isEditing && (
                        <div className='flex gap-2 mt-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <IconCamera className='h-3 w-3 mr-1' />
                                Upload Photo
                            </Button>
                            {account.avatar_url && (
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={handleDeleteAvatar}
                                    disabled={updating}
                                >
                                    <IconX className='h-3 w-3 mr-1' />
                                    Remove
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                {!isEditing && (
                    <Button variant='outline' size='sm' onClick={() => setIsEditing(true)}>
                        <IconEdit className='h-4 w-4 mr-2' />
                        Edit
                    </Button>
                )}
            </div>

            {/* Profile Information Card */}
            <Card className='border-0 bg-neutral-900/50'>
                <CardHeader className='pb-4'>
                    <CardTitle className='text-lg'>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 pt-0'>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='full_name'>Full Name</Label>
                            <Input
                                id='full_name'
                                value={
                                    isEditing
                                        ? editedAccount.full_name || ''
                                        : account.full_name || ''
                                }
                                onChange={(e) =>
                                    setEditedAccount({
                                        ...editedAccount,
                                        full_name: e.target.value,
                                    })
                                }
                                disabled={!isEditing}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='email'>Email Address</Label>
                            <Input
                                id='email'
                                value={account.billing_email || ''}
                                disabled
                                className='bg-neutral-800/50'
                            />
                            <p className='text-xs text-neutral-400'>
                                Email cannot be changed. Contact support if needed.
                            </p>
                        </div>
                    </div>

                    {/* Avatar Upload Section for Email Users */}
                    {canEditAvatar && isEditing && avatarFile && (
                        <div className='space-y-2'>
                            <Label>Selected Avatar</Label>
                            <div className='flex items-center gap-3 p-3 bg-neutral-800/50 rounded-md'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage src={previewUrl ?? undefined} />
                                    <AvatarFallback>
                                        {account.full_name?.[0]?.toUpperCase() ??
                                            account.billing_email?.[0]?.toUpperCase() ??
                                            'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex-1'>
                                    <p className='text-sm'>{avatarFile.name}</p>
                                    <p className='text-xs text-neutral-400'>
                                        {(avatarFile.size / 1024).toFixed(1)} KB • Ready to upload
                                    </p>
                                </div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => {
                                        setAvatarFile(null);
                                        setPreviewUrl(null);
                                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                                    }}
                                >
                                    <IconX className='h-3 w-3 mr-1' />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* OAuth Avatar Info */}
                    {!canEditAvatar && account.avatar_url && (
                        <div className='space-y-2'>
                            <Label>Profile Avatar</Label>
                            <div className='flex items-center gap-3 p-3 bg-neutral-800/50 rounded-md'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarImage src={account.avatar_url} />
                                    <AvatarFallback>
                                        {account.full_name?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex-1'>
                                    <p className='text-sm'>
                                        Avatar from{' '}
                                        {account.provider === 'google'
                                            ? 'Google'
                                            : account.provider}
                                    </p>
                                    <p className='text-xs text-neutral-400'>
                                        Automatically synced from your OAuth provider
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Actions */}
                    {isEditing && (
                        <div className='flex gap-2 pt-4'>
                            <Button onClick={handleSave} disabled={updating || uploadingAvatar}>
                                {updating || uploadingAvatar ? (
                                    <>
                                        <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-white'></div>
                                        {uploadingAvatar ? 'Uploading...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <IconDeviceFloppy className='h-4 w-4 mr-2' />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button
                                variant='outline'
                                onClick={handleCancel}
                                disabled={updating || uploadingAvatar}
                            >
                                <IconX className='h-4 w-4 mr-2' />
                                Cancel
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Billing Information Card */}
            <Card className='border-0 bg-neutral-900/50'>
                <CardHeader className='pb-4'>
                    <CardTitle className='text-lg'>Billing Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 pt-0'>
                    {/* Billing Type Toggle */}
                    <div className='space-y-3'>
                        <div>
                            <Label className='text-base font-medium'>How should we bill you?</Label>
                            <p className='text-sm text-neutral-400 mt-1'>
                                Choose how you want to receive invoices and what information appears
                                on them.
                            </p>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <label
                                className={`
                                flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-200
                                ${
                                    (
                                        isEditing
                                            ? editedAccount.billing_type === 'individual'
                                            : account.billing_type === 'individual'
                                    )
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-neutral-700 hover:border-neutral-600'
                                }
                                ${!isEditing ? 'cursor-not-allowed opacity-75' : ''}
                            `}
                            >
                                <div className='flex items-center space-x-3'>
                                    <input
                                        type='radio'
                                        name='billing_type'
                                        value='individual'
                                        checked={
                                            isEditing
                                                ? editedAccount.billing_type === 'individual'
                                                : account.billing_type === 'individual'
                                        }
                                        onChange={(e) =>
                                            setEditedAccount({
                                                ...editedAccount,
                                                billing_type: e.target.value as
                                                    | 'individual'
                                                    | 'business',
                                            })
                                        }
                                        disabled={!isEditing}
                                        className='text-blue-600 w-4 h-4'
                                    />
                                    <div>
                                        <div className='font-medium text-white'>Personal</div>
                                        <div className='text-sm text-neutral-400'>
                                            Individual subscription for personal use
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <label
                                className={`
                                flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-200
                                ${
                                    (
                                        isEditing
                                            ? editedAccount.billing_type === 'business'
                                            : account.billing_type === 'business'
                                    )
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-neutral-700 hover:border-neutral-600'
                                }
                                ${!isEditing ? 'cursor-not-allowed opacity-75' : ''}
                            `}
                            >
                                <div className='flex items-center space-x-3'>
                                    <input
                                        type='radio'
                                        name='billing_type'
                                        value='business'
                                        checked={
                                            isEditing
                                                ? editedAccount.billing_type === 'business'
                                                : account.billing_type === 'business'
                                        }
                                        onChange={(e) =>
                                            setEditedAccount({
                                                ...editedAccount,
                                                billing_type: e.target.value as
                                                    | 'individual'
                                                    | 'business',
                                            })
                                        }
                                        disabled={!isEditing}
                                        className='text-blue-600 w-4 h-4'
                                    />
                                    <div>
                                        <div className='font-medium text-white'>Business</div>
                                        <div className='text-sm text-neutral-400'>
                                            Company subscription with business details on invoices
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div className='text-xs text-neutral-500 bg-neutral-800/30 p-3 rounded-lg'>
                            <strong>Personal:</strong> Invoices will be addressed to you personally
                            using your name and email.
                            <br />
                            <strong>Business:</strong> Invoices will include your company
                            information, address, and tax details for business accounting.
                        </div>
                    </div>

                    {/* Company Information - Only show if business billing */}
                    {(isEditing
                        ? editedAccount.billing_type === 'business'
                        : account.billing_type === 'business') && (
                        <div className='space-y-4 border-t border-neutral-700 pt-4'>
                            <h4 className='font-medium text-neutral-300'>Company Details</h4>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='company_name'>Company Name *</Label>
                                    <Input
                                        id='company_name'
                                        value={
                                            isEditing
                                                ? editedAccount.company_name || ''
                                                : account.company_name || ''
                                        }
                                        onChange={(e) =>
                                            setEditedAccount({
                                                ...editedAccount,
                                                company_name: e.target.value,
                                            })
                                        }
                                        disabled={!isEditing}
                                        placeholder='Your Company Inc.'
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='company_tax_id'>Tax ID / EIN</Label>
                                    <Input
                                        id='company_tax_id'
                                        value={
                                            isEditing
                                                ? editedAccount.company_tax_id || ''
                                                : account.company_tax_id || ''
                                        }
                                        onChange={(e) =>
                                            setEditedAccount({
                                                ...editedAccount,
                                                company_tax_id: e.target.value,
                                            })
                                        }
                                        disabled={!isEditing}
                                        placeholder='12-3456789'
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='company_address_line1'>Address Line 1 *</Label>
                                <Input
                                    id='company_address_line1'
                                    value={
                                        isEditing
                                            ? editedAccount.company_address_line1 || ''
                                            : account.company_address_line1 || ''
                                    }
                                    onChange={(e) =>
                                        setEditedAccount({
                                            ...editedAccount,
                                            company_address_line1: e.target.value,
                                        })
                                    }
                                    disabled={!isEditing}
                                    placeholder='123 Business Street'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='company_address_line2'>Address Line 2</Label>
                                <Input
                                    id='company_address_line2'
                                    value={
                                        isEditing
                                            ? editedAccount.company_address_line2 || ''
                                            : account.company_address_line2 || ''
                                    }
                                    onChange={(e) =>
                                        setEditedAccount({
                                            ...editedAccount,
                                            company_address_line2: e.target.value,
                                        })
                                    }
                                    disabled={!isEditing}
                                    placeholder='Suite 100'
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='company_city'>City *</Label>
                                    <Input
                                        id='company_city'
                                        value={
                                            isEditing
                                                ? editedAccount.company_city || ''
                                                : account.company_city || ''
                                        }
                                        onChange={(e) =>
                                            setEditedAccount({
                                                ...editedAccount,
                                                company_city: e.target.value,
                                            })
                                        }
                                        disabled={!isEditing}
                                        placeholder='New York'
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='company_state'>State/Province *</Label>
                                    <Input
                                        id='company_state'
                                        value={
                                            isEditing
                                                ? editedAccount.company_state || ''
                                                : account.company_state || ''
                                        }
                                        onChange={(e) =>
                                            setEditedAccount({
                                                ...editedAccount,
                                                company_state: e.target.value,
                                            })
                                        }
                                        disabled={!isEditing}
                                        placeholder='NY'
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='company_postal_code'>ZIP/Postal Code *</Label>
                                    <Input
                                        id='company_postal_code'
                                        value={
                                            isEditing
                                                ? editedAccount.company_postal_code || ''
                                                : account.company_postal_code || ''
                                        }
                                        onChange={(e) =>
                                            setEditedAccount({
                                                ...editedAccount,
                                                company_postal_code: e.target.value,
                                            })
                                        }
                                        disabled={!isEditing}
                                        placeholder='10001'
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='company_country'>Country *</Label>
                                    <Input
                                        id='company_country'
                                        value={
                                            isEditing
                                                ? editedAccount.company_country || ''
                                                : account.company_country || ''
                                        }
                                        onChange={(e) =>
                                            setEditedAccount({
                                                ...editedAccount,
                                                company_country: e.target.value,
                                            })
                                        }
                                        disabled={!isEditing}
                                        placeholder='US'
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='vat_number'>VAT Number</Label>
                                    <Input
                                        id='vat_number'
                                        value={
                                            isEditing
                                                ? editedAccount.vat_number || ''
                                                : account.vat_number || ''
                                        }
                                        onChange={(e) =>
                                            setEditedAccount({
                                                ...editedAccount,
                                                vat_number: e.target.value,
                                            })
                                        }
                                        disabled={!isEditing}
                                        placeholder='GB123456789'
                                    />
                                </div>
                            </div>

                            <p className='text-xs text-neutral-400'>
                                * Required fields for business billing
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Account Information Card */}
            <Card className='border-0 bg-neutral-900/50'>
                <CardHeader className='pb-4'>
                    <CardTitle className='text-lg'>Account Information</CardTitle>
                </CardHeader>
                <CardContent className='pt-0'>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                        <div>
                            <Label className='text-neutral-400'>Account Created</Label>
                            <p>{new Date(account.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <Label className='text-neutral-400'>Last Updated</Label>
                            <p>{new Date(account.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <Label className='text-neutral-400'>Plan</Label>
                            <p className='capitalize'>{account.plan_name || 'Free'}</p>
                        </div>
                        <div>
                            <Label className='text-neutral-400'>Role</Label>
                            <p className='capitalize'>{account.role}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
