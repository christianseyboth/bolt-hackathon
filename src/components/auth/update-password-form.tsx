'use client';

import React, { useState, useTransition } from 'react';
import { IconEye, IconEyeOff, IconLoader2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/components/ui/use-toast';
import { updatePassword } from '@/app/auth/actions';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UpdatePasswordFormProps {
    className?: string;
}

export function UpdatePasswordForm({ className }: UpdatePasswordFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = async (formData: FormData) => {
        setFormError(null);

        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setFormError("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            setFormError('Password must be at least 6 characters long');
            return;
        }

        startTransition(async () => {
            try {
                const result = await updatePassword(formData);
                if (result?.error) {
                    setFormError(result.error);
                } else {
                    toast({
                        title: 'Password updated successfully',
                        description: 'Your password has been updated.',
                    });
                }
            } catch (error) {
                console.error('Password update error:', error);
                setFormError('An unexpected error occurred. Please try again.');
            }
        });
    };

    return (
        <div className={cn('space-y-6 w-full max-w-md mx-auto', className)}>
            <div className='space-y-2 text-center'>
                <h1 className='text-2xl font-bold'>Update your password</h1>
                <p className='text-sm text-neutral-500 dark:text-neutral-400'>
                    Enter your new password below
                </p>
            </div>

            {/* Error Message */}
            {formError && (
                <div className='bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md text-sm'>
                    {formError}
                </div>
            )}

            {/* Password Update Form */}
            <form action={handleSubmit}>
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='password'>New Password</Label>
                        <div className='relative'>
                            <Input
                                id='password'
                                name='password'
                                type={showPassword ? 'text' : 'password'}
                                placeholder='••••••••'
                                required
                                minLength={6}
                                disabled={isPending}
                                className='bg-neutral-800 border-neutral-700 text-white pr-10'
                            />
                            <Button
                                type='button'
                                variant='ghost'
                                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isPending}
                            >
                                {showPassword ? (
                                    <IconEyeOff className='h-4 w-4 text-neutral-400' />
                                ) : (
                                    <IconEye className='h-4 w-4 text-neutral-400' />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='confirm-password'>Confirm New Password</Label>
                        <div className='relative'>
                            <Input
                                id='confirm-password'
                                name='confirmPassword'
                                type={showPassword ? 'text' : 'password'}
                                placeholder='••••••••'
                                required
                                minLength={6}
                                disabled={isPending}
                                className='bg-neutral-800 border-neutral-700 text-white pr-10'
                            />
                            <Button
                                type='button'
                                variant='ghost'
                                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isPending}
                            >
                                {showPassword ? (
                                    <IconEyeOff className='h-4 w-4 text-neutral-400' />
                                ) : (
                                    <IconEye className='h-4 w-4 text-neutral-400' />
                                )}
                            </Button>
                        </div>
                    </div>

                    <Button type='submit' className='w-full' disabled={isPending}>
                        {isPending ? (
                            <>
                                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                                Updating password...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </Button>
                </div>
            </form>

            {/* Back to login link */}
            <div className='text-center text-sm'>
                <Link href='/login' className='text-cyan-500 hover:text-cyan-400'>
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}
