'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    IconShield,
    IconKey,
    IconQrcode,
    IconCopy,
    IconCheck,
    IconX,
    IconAlertTriangle,
    IconLock,
    IconBrandGoogle,
    IconBrandGithub,
    IconMail,
    IconRefresh,
} from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import QRCode from 'qrcode';

interface UserSecurityInfo {
    id: string;
    email: string;
    provider: string;
    isOAuthUser: boolean;
    emailVerified: boolean;
    mfaEnabled: boolean;
    lastSignIn: string;
}

export function SecuritySettings() {
    const [user, setUser] = useState<UserSecurityInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [mfaLoading, setMfaLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showMfaSetup, setShowMfaSetup] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [mfaSecret, setMfaSecret] = useState<string>('');
    const [factorId, setFactorId] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showMfaDisableDialog, setShowMfaDisableDialog] = useState(false);
    const [mfaDisableCode, setMfaDisableCode] = useState('');
    const mfaDisableResolver = useRef<((value: string | null) => void) | null>(null);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        fetchUserSecurityInfo();
    }, []);

    const fetchUserSecurityInfo = async () => {
        setLoading(true);
        try {
            const {
                data: { user: authUser },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError || !authUser) {
                console.error('User not found:', userError);
                // Instead of throwing an error, just keep user as null and stop loading
                setLoading(false);
                return;
            }

            // Check if user is OAuth-based
            const isOAuthUser = authUser.app_metadata.provider !== 'email';
            const provider = authUser.app_metadata.provider || 'email';

            // Get MFA factors
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const mfaEnabled = (factors?.totp?.length ?? 0) > 0;

            setUser({
                id: authUser.id,
                email: authUser.email || '',
                provider,
                isOAuthUser,
                emailVerified: authUser.email_confirmed_at !== null,
                mfaEnabled,
                lastSignIn: authUser.last_sign_in_at || '',
            });
        } catch (error) {
            console.error('Error fetching user security info:', error);
            toast({
                title: 'Error',
                description: 'Failed to load security information',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEnableMfa = async () => {
        setMfaLoading(true);
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                friendlyName: 'ProActiv Authenticator',
            });

            if (error) throw error;

            if (data) {
                setMfaSecret(data.totp.secret);
                setFactorId(data.id); // Store the factor ID
                // Generate QR code
                const qrUrl = await QRCode.toDataURL(data.totp.uri);
                setQrCodeUrl(qrUrl);
                setShowMfaSetup(true);
            }
        } catch (error) {
            console.error('Error enabling MFA:', error);
            toast({
                title: 'Error',
                description: 'Failed to enable two-factor authentication',
                variant: 'destructive',
            });
        } finally {
            setMfaLoading(false);
        }
    };

    const handleVerifyMfa = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast({
                title: 'Error',
                description: 'Please enter a valid 6-digit code',
                variant: 'destructive',
            });
            return;
        }

        if (!factorId) {
            toast({
                title: 'Error',
                description: 'Factor ID not found. Please restart the setup process.',
                variant: 'destructive',
            });
            return;
        }

        try {
            // First create a challenge for the factor
            const { data: challengeData, error: challengeError } =
                await supabase.auth.mfa.challenge({
                    factorId: factorId,
                });

            if (challengeError) throw challengeError;

            // Then verify the challenge with the code
            const { data, error } = await supabase.auth.mfa.verify({
                factorId: factorId,
                challengeId: challengeData.id,
                code: verificationCode,
            });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Two-factor authentication enabled successfully',
            });

            setShowMfaSetup(false);
            setVerificationCode('');
            setFactorId('');
            setMfaSecret('');
            setQrCodeUrl('');
            await fetchUserSecurityInfo();
        } catch (error) {
            console.error('Error verifying MFA:', error);
            toast({
                title: 'Error',
                description: 'Invalid verification code',
                variant: 'destructive',
            });
        }
    };

    const handleDisableMfa = async () => {
        try {
            // First, we need to complete an MFA challenge to meet AAL2 requirements
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const totpFactor = factors?.totp?.find((factor) => factor.status === 'verified');

            if (!totpFactor) {
                throw new Error('No verified MFA factor found');
            }

            // Create an MFA challenge first
            const { data: challengeData, error: challengeError } =
                await supabase.auth.mfa.challenge({
                    factorId: totpFactor.id,
                });

            if (challengeError) {
                throw new Error(`Failed to create MFA challenge: ${challengeError.message}`);
            }

            // Show dialog to get verification code from user
            const verificationCode = await showMfaVerificationDialog();

            if (!verificationCode) {
                return; // User cancelled
            }

            // Verify the MFA challenge
            const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
                factorId: totpFactor.id,
                challengeId: challengeData.id,
                code: verificationCode,
            });

            if (verifyError) {
                throw new Error('Invalid verification code');
            }

            // Now we can safely unenroll the factor
            const { error: unenrollError } = await supabase.auth.mfa.unenroll({
                factorId: totpFactor.id,
            });

            if (unenrollError) {
                throw new Error(`Failed to disable MFA: ${unenrollError.message}`);
            }

            toast({
                title: 'Success',
                description: 'Two-factor authentication disabled successfully',
            });

            await fetchUserSecurityInfo();
        } catch (error) {
            console.error('Error disabling MFA:', error);
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to disable two-factor authentication',
                variant: 'destructive',
            });
        }
    };

    // Helper function to show MFA verification dialog
    const showMfaVerificationDialog = (): Promise<string | null> => {
        return new Promise((resolve) => {
            setShowMfaDisableDialog(true);
            mfaDisableResolver.current = resolve;
        });
    };

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({
                title: 'Error',
                description: 'Please fill in all password fields',
                variant: 'destructive',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Error',
                description: 'New passwords do not match',
                variant: 'destructive',
            });
            return;
        }

        if (newPassword.length < 8) {
            toast({
                title: 'Error',
                description: 'Password must be at least 8 characters long',
                variant: 'destructive',
            });
            return;
        }

        setPasswordLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Password changed successfully',
            });

            setShowPasswordChange(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            toast({
                title: 'Error',
                description: 'Failed to change password',
                variant: 'destructive',
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied to clipboard',
            description: 'Secret key copied to clipboard',
        });
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'google':
                return <IconBrandGoogle className='h-4 w-4' />;
            case 'github':
                return <IconBrandGithub className='h-4 w-4' />;
            default:
                return <IconMail className='h-4 w-4' />;
        }
    };

    const getProviderName = (provider: string) => {
        switch (provider) {
            case 'google':
                return 'Google';
            case 'github':
                return 'GitHub';
            default:
                return 'Email';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <Card className='border border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <IconShield className='h-5 w-5' />
                        Security Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='animate-pulse space-y-6'>
                        <div className='h-16 bg-neutral-800 rounded'></div>
                        <div className='h-16 bg-neutral-800 rounded'></div>
                        <div className='h-16 bg-neutral-800 rounded'></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card className='border border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <IconShield className='h-5 w-5' />
                        Security Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8 text-neutral-400'>
                        <IconShield className='h-12 w-12 mx-auto mb-4 opacity-50' />
                        <p>Unable to load security information</p>
                        <p className='text-sm mt-2'>
                            Please try refreshing the page or signing in again
                        </p>
                        <Button variant='outline' onClick={fetchUserSecurityInfo} className='mt-4'>
                            <IconRefresh className='h-4 w-4 mr-2' />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className='border border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <IconShield className='h-5 w-5' />
                        Security Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    {/* Authentication Method */}
                    <div className='p-4 bg-neutral-800/50 rounded-lg'>
                        <div className='flex items-center justify-between mb-2'>
                            <Label className='text-base'>Authentication Method</Label>
                            <Badge className='flex items-center gap-1 bg-neutral-700 text-neutral-200 border-neutral-600'>
                                {getProviderIcon(user.provider)}
                                {getProviderName(user.provider)}
                            </Badge>
                        </div>
                        <div className='text-sm text-neutral-400 space-y-1'>
                            <div>Email: {user.email}</div>
                            <div className='flex items-center gap-2'>
                                Status:
                                {user.emailVerified ? (
                                    <Badge className='text-xs bg-emerald-600 text-white border-emerald-500'>
                                        <IconCheck className='h-3 w-3 mr-1' />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge className='text-xs bg-red-600 text-white border-red-500'>
                                        <IconX className='h-3 w-3 mr-1' />
                                        Unverified
                                    </Badge>
                                )}
                            </div>
                            {user.lastSignIn && (
                                <div>Last sign in: {formatDate(user.lastSignIn)}</div>
                            )}
                        </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className='flex items-center justify-between p-4 border border-neutral-800 rounded-lg'>
                        <div>
                            <Label className='text-base'>Two-Factor Authentication</Label>
                            <p className='text-sm text-neutral-400 mt-1'>
                                Add an extra layer of security to your account using an
                                authenticator app
                            </p>
                            {user.mfaEnabled && (
                                <Badge className='text-xs bg-emerald-600 text-white border-emerald-500 mt-2'>
                                    <IconCheck className='h-3 w-3 mr-1' />
                                    Enabled
                                </Badge>
                            )}
                        </div>
                        <div className='flex gap-2'>
                            {user.mfaEnabled ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant='outline' size='sm'>
                                            Disable
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className='bg-neutral-900 border-neutral-800'>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Disable Two-Factor Authentication
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to disable two-factor
                                                authentication? This will make your account less
                                                secure.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDisableMfa}
                                                className='bg-red-600 hover:bg-red-700'
                                            >
                                                Disable 2FA
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <Button onClick={handleEnableMfa} disabled={mfaLoading} size='sm'>
                                    {mfaLoading ? 'Setting up...' : 'Enable'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Password Management - Only for email users */}
                    {!user.isOAuthUser && (
                        <div className='flex items-center justify-between p-4 border border-neutral-800 rounded-lg'>
                            <div>
                                <Label className='text-base'>Password</Label>
                                <p className='text-sm text-neutral-400 mt-1'>
                                    Change your account password
                                </p>
                            </div>
                            <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
                                <DialogTrigger asChild>
                                    <Button variant='outline' size='sm'>
                                        <IconLock className='h-4 w-4 mr-2' />
                                        Change Password
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className='bg-neutral-900 border-neutral-800'>
                                    <DialogHeader>
                                        <DialogTitle>Change Password</DialogTitle>
                                        <DialogDescription>
                                            Enter your current password and choose a new secure
                                            password.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className='space-y-4'>
                                        <div>
                                            <Label htmlFor='currentPassword'>
                                                Current Password
                                            </Label>
                                            <Input
                                                id='currentPassword'
                                                type='password'
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className='mt-1'
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor='newPassword'>New Password</Label>
                                            <Input
                                                id='newPassword'
                                                type='password'
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className='mt-1'
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor='confirmPassword'>
                                                Confirm New Password
                                            </Label>
                                            <Input
                                                id='confirmPassword'
                                                type='password'
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className='mt-1'
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant='outline'
                                            onClick={() => setShowPasswordChange(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handlePasswordChange}
                                            disabled={passwordLoading}
                                        >
                                            {passwordLoading ? 'Changing...' : 'Change Password'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {/* OAuth Users Password Notice */}
                    {user.isOAuthUser && (
                        <div className='p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
                            <div className='flex items-start gap-3'>
                                {getProviderIcon(user.provider)}
                                <div>
                                    <h4 className='font-medium text-blue-400 mb-1'>
                                        OAuth Authentication
                                    </h4>
                                    <p className='text-sm text-neutral-300'>
                                        You signed in with {getProviderName(user.provider)}. Your
                                        password is managed by {getProviderName(user.provider)} and
                                        cannot be changed here.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* MFA Setup Dialog */}
            <Dialog open={showMfaSetup} onOpenChange={setShowMfaSetup}>
                <DialogContent className='bg-neutral-900 border-neutral-800 max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <IconQrcode className='h-5 w-5' />
                            Setup Two-Factor Authentication
                        </DialogTitle>
                        <DialogDescription>
                            Scan the QR code with your authenticator app and enter the verification
                            code.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-6'>
                        {/* QR Code */}
                        {qrCodeUrl && (
                            <div className='text-center'>
                                <img
                                    src={qrCodeUrl}
                                    alt='QR Code'
                                    className='mx-auto bg-white p-4 rounded-lg'
                                />
                            </div>
                        )}

                        {/* Manual Entry */}
                        <div>
                            <Label>Manual Entry Key</Label>
                            <div className='flex gap-2 mt-1'>
                                <Input value={mfaSecret} readOnly className='font-mono text-sm' />
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => copyToClipboard(mfaSecret)}
                                >
                                    <IconCopy className='h-4 w-4' />
                                </Button>
                            </div>
                            <p className='text-xs text-neutral-400 mt-1'>
                                Use this if you can't scan the QR code
                            </p>
                        </div>

                        {/* Verification Code */}
                        <div>
                            <Label htmlFor='verificationCode'>Verification Code</Label>
                            <Input
                                id='verificationCode'
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder='Enter 6-digit code'
                                maxLength={6}
                                className='mt-1'
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setShowMfaSetup(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleVerifyMfa} disabled={verificationCode.length !== 6}>
                            Verify & Enable
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MFA Disable Verification Dialog */}
            <Dialog
                open={showMfaDisableDialog}
                onOpenChange={(open) => {
                    setShowMfaDisableDialog(open);
                    if (!open && mfaDisableResolver.current) {
                        mfaDisableResolver.current(null); // User cancelled
                        mfaDisableResolver.current = null;
                        setMfaDisableCode('');
                    }
                }}
            >
                <DialogContent className='bg-neutral-900 border-neutral-800 max-w-md'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <IconShield className='h-5 w-5' />
                            Verify to Disable MFA
                        </DialogTitle>
                        <DialogDescription>
                            For security, please enter your authenticator code to disable two-factor
                            authentication.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='mfaDisableCode'>Authenticator Code</Label>
                            <Input
                                id='mfaDisableCode'
                                value={mfaDisableCode}
                                onChange={(e) =>
                                    setMfaDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                }
                                placeholder='Enter 6-digit code'
                                maxLength={6}
                                className='mt-1 text-center text-lg tracking-widest'
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setShowMfaDisableDialog(false);
                                if (mfaDisableResolver.current) {
                                    mfaDisableResolver.current(null);
                                    mfaDisableResolver.current = null;
                                    setMfaDisableCode('');
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (mfaDisableCode.length === 6 && mfaDisableResolver.current) {
                                    try {
                                        mfaDisableResolver.current(mfaDisableCode);
                                        mfaDisableResolver.current = null;
                                        setMfaDisableCode('');
                                        setShowMfaDisableDialog(false);
                                    } catch (error) {
                                        console.error('Error in MFA disable resolver:', error);
                                    }
                                }
                            }}
                            disabled={mfaDisableCode.length !== 6}
                            className='bg-red-600 hover:bg-red-700'
                        >
                            Verify & Disable MFA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
