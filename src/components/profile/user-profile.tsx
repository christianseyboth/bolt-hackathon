'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { IconCheck, IconEdit, IconX } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    provider: string;
    created_at: string;
    updated_at: string;
}

interface UserProfileProps {
    initialUser?: any; // User from auth
}

export function UserProfile({ initialUser }: UserProfileProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    // Fetch user profile data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load profile data.',
                });
            } else {
                setProfile(profileData);
                setEditedProfile(profileData);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile) return;

        setUpdating(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editedProfile.full_name,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id);

            if (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to update profile.',
                });
            } else {
                setProfile({ ...profile, ...editedProfile });
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
        setEditedProfile(profile || {});
        setIsEditing(false);
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

    if (!profile) {
        return (
            <div className='text-center py-8'>
                <p className='text-neutral-400'>No profile data found.</p>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Profile Header */}
            <div className='space-y-4'>
                {/* Mobile Layout */}
                <div className='block sm:hidden'>
                    <div className='flex items-center space-x-4 mb-4'>
                        <Avatar className='h-16 w-16'>
                            <AvatarImage
                                src={profile.avatar_url || undefined}
                                alt={profile.full_name}
                            />
                            <AvatarFallback className='text-lg'>
                                {profile.full_name?.[0]?.toUpperCase() ||
                                    profile.email[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                            <h2 className='text-xl font-semibold truncate'>{profile.full_name}</h2>
                            <p className='text-neutral-400 text-sm truncate'>{profile.email}</p>
                        </div>
                        {!isEditing && (
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setIsEditing(true)}
                                className='shrink-0'
                            >
                                <IconEdit className='h-4 w-4 mr-2' />
                                Edit
                            </Button>
                        )}
                    </div>

                    {/* Mobile Badges */}
                    <div className='flex flex-wrap gap-2'>
                        <Badge className='text-xs bg-neutral-700 text-neutral-200 border-neutral-600'>
                            {profile.provider === 'email' ? 'Email' : `OAuth (${profile.provider})`}
                        </Badge>
                        {profile.avatar_url && (
                            <Badge className='text-xs bg-emerald-600 text-white border-emerald-500'>
                                <IconCheck className='h-3 w-3 mr-1' />
                                Avatar
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className='hidden sm:flex items-center space-x-4'>
                    <Avatar className='h-16 w-16'>
                        <AvatarImage
                            src={profile.avatar_url || undefined}
                            alt={profile.full_name}
                        />
                        <AvatarFallback className='text-lg'>
                            {profile.full_name?.[0]?.toUpperCase() ||
                                profile.email[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                            <h2 className='text-xl font-semibold'>{profile.full_name}</h2>
                            <Badge className='text-xs bg-neutral-700 text-neutral-200 border-neutral-600'>
                                {profile.provider === 'email'
                                    ? 'Email'
                                    : `OAuth (${profile.provider})`}
                            </Badge>
                            {profile.avatar_url && (
                                <Badge className='text-xs bg-emerald-600 text-white border-emerald-500'>
                                    <IconCheck className='h-3 w-3 mr-1' />
                                    Avatar
                                </Badge>
                            )}
                        </div>
                        <p className='text-neutral-400'>{profile.email}</p>
                    </div>
                    {!isEditing && (
                        <Button variant='outline' size='sm' onClick={() => setIsEditing(true)}>
                            <IconEdit className='h-4 w-4 mr-2' />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            {/* Profile Form */}
            <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='full_name'>Full Name</Label>
                        <Input
                            id='full_name'
                            value={isEditing ? editedProfile.full_name || '' : profile.full_name}
                            onChange={(e) =>
                                setEditedProfile({ ...editedProfile, full_name: e.target.value })
                            }
                            disabled={!isEditing}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='email'>Email Address</Label>
                        <Input
                            id='email'
                            value={profile.email}
                            disabled
                            className='bg-neutral-800/50'
                        />
                        <p className='text-xs text-neutral-400'>
                            Email cannot be changed. Contact support if needed.
                        </p>
                    </div>
                </div>

                {profile.avatar_url && (
                    <div className='space-y-2'>
                        <Label>Profile Avatar</Label>
                        <div className='flex items-center gap-3 p-3 bg-neutral-800/50 rounded-md'>
                            <Avatar className='h-8 w-8'>
                                <AvatarImage src={profile.avatar_url} />
                                <AvatarFallback>
                                    {profile.full_name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                                <p className='text-sm'>
                                    Avatar from{' '}
                                    {profile.provider === 'google' ? 'Google' : profile.provider}
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
                    <div className='flex flex-col sm:flex-row gap-2 pt-4'>
                        <Button
                            onClick={handleSave}
                            disabled={updating}
                            className='w-full sm:w-auto'
                        >
                            {updating ? (
                                <>
                                    <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-white'></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <IconCheck className='h-4 w-4 mr-2' />
                                    Save Changes
                                </>
                            )}
                        </Button>
                        <Button
                            variant='outline'
                            onClick={handleCancel}
                            disabled={updating}
                            className='w-full sm:w-auto'
                        >
                            <IconX className='h-4 w-4 mr-2' />
                            Cancel
                        </Button>
                    </div>
                )}

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'>
                    <div>
                        <Label className='text-neutral-400'>Account Created</Label>
                        <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <Label className='text-neutral-400'>Last Updated</Label>
                        <p>{new Date(profile.updated_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <Label className='text-neutral-400'>Auth Provider</Label>
                        <p className='capitalize'>{profile.provider}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
