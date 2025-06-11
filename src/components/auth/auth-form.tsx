'use client';

import React, { useState, useTransition } from 'react';
import {
    IconBrandGithub,
    IconBrandGoogle,
    IconEye,
    IconEyeOff,
    IconLoader2,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { signIn, signUp, signInWithOAuth, resetPassword } from '@/app/auth/actions';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AuthFormProps {
    mode: 'login' | 'register' | 'reset';
    className?: string;
}

export function AuthForm({ mode, className }: AuthFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const isLoginMode = mode === 'login';
    const isRegisterMode = mode === 'register';
    const isResetMode = mode === 'reset';

    // Handle OAuth authentication
    const handleSocialAuth = async (provider: 'github' | 'google') => {
        setFormError(null);
        startTransition(async () => {
            try {
                const result = await signInWithOAuth(provider);
                if (result?.error) {
                    setFormError(result.error);
                }
            } catch (error) {
                console.error(`Error with ${provider} auth:`, error);
                setFormError('An unexpected error occurred with social login.');
            }
        });
    };

    // Handle form submission for login/register
    const handleSubmit = async (formData: FormData) => {
        setFormError(null);
        startTransition(async () => {
            try {
                let result;
                if (isLoginMode) {
                    result = await signIn(formData);
                } else if (isRegisterMode) {
                    // Validate password match on client side first
                    const password = formData.get('password') as string;
                    const confirmPassword = formData.get('confirmPassword') as string;

                    if (password !== confirmPassword) {
                        setFormError("Passwords don't match");
                        return;
                    }
                    result = await signUp(formData);
                } else if (isResetMode) {
                    result = await resetPassword(formData);
                    if (!result?.error) {
                        toast({
                            title: 'Password reset email sent',
                            description: 'Please check your email for password reset instructions.',
                        });
                        return;
                    }
                }

                if (result?.error) {
                    setFormError(result.error);
                } else {
                    toast({
                        title: isLoginMode ? 'Login successful' : 'Registration successful',
                        description: isLoginMode ? 'Welcome back!' : 'Your account has been created.',
                    });
                }
            } catch (error) {
                console.error('Form submission error:', error);
                setFormError('An unexpected error occurred. Please try again.');
            }
        });
    };

    return (
        <div className={cn('space-y-6 w-full max-w-md mx-auto', className)}>
            <div className='space-y-2 text-center'>
                <h1 className='text-2xl font-bold'>
                    {isLoginMode && 'Welcome back'}
                    {isRegisterMode && 'Create an account'}
                    {isResetMode && 'Reset your password'}
                </h1>
                <p className='text-sm text-neutral-500 dark:text-neutral-400'>
                    {isLoginMode && 'Enter your email below to login to your account'}
                    {isRegisterMode && 'Enter your information to create your account'}
                    {isResetMode && "Enter your email and we'll send you a reset link"}
                </p>
            </div>

            {/* Social Auth Buttons */}
            {!isResetMode && (
                <div className='grid grid-cols-2 gap-4'>
                    <Button
                        variant='outline'
                        className='bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                        onClick={() => handleSocialAuth('github')}
                        disabled={isPending}
                    >
                        <IconBrandGithub className='mr-2 h-4 w-4' />
                        GitHub
                    </Button>
                    <Button
                        variant='outline'
                        className='bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                        onClick={() => handleSocialAuth('google')}
                        disabled={isPending}
                    >
                        <IconBrandGoogle className='mr-2 h-4 w-4' />
                        Google
                    </Button>
                </div>
            )}

            {/* Divider */}
            <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t border-neutral-700'></span>
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-neutral-900 px-2 text-neutral-500'>
                        {!isResetMode ? 'Or continue with' : 'Password reset'}
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {formError && (
                <div className='bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md text-sm'>
                    {formError}
                </div>
            )}

            {/* Email/Password Form */}
            <form action={handleSubmit}>
                <div className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                            id='email'
                            name='email'
                            type='email'
                            placeholder='name@example.com'
                            required
                            disabled={isPending}
                            className='bg-neutral-800 border-neutral-700 text-white'
                        />
                    </div>

                    {!isResetMode && (
                        <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                                <Label htmlFor='password'>Password</Label>
                                {isLoginMode && (
                                    <Link
                                        href='/reset-password'
                                        className='text-xs text-neutral-400 hover:text-white'
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <div className='relative'>
                                <Input
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='••••••••'
                                    required
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
                    )}

                    {isRegisterMode && (
                        <div className='space-y-2'>
                            <Label htmlFor='confirm-password'>Confirm Password</Label>
                            <div className='relative'>
                                <Input
                                    id='confirm-password'
                                    name='confirmPassword'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='••••••••'
                                    required
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
                    )}

                    <Button type='submit' className='w-full' disabled={isPending}>
                        {isPending ? (
                            <>
                                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                                {isLoginMode && 'Logging in...'}
                                {isRegisterMode && 'Creating account...'}
                                {isResetMode && 'Sending reset link...'}
                            </>
                        ) : (
                            <>
                                {isLoginMode && 'Sign In'}
                                {isRegisterMode && 'Create Account'}
                                {isResetMode && 'Send Reset Link'}
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Switch between login and register */}
            <div className='text-center text-sm'>
                {isLoginMode && (
                    <>
                        Don&apos;t have an account?{' '}
                        <Link href='/register' className='text-cyan-500 hover:text-cyan-400'>
                            Sign up
                        </Link>
                    </>
                )}
                {isRegisterMode && (
                    <>
                        Already have an account?{' '}
                        <Link href='/login' className='text-cyan-500 hover:text-cyan-400'>
                            Sign in
                        </Link>
                    </>
                )}
                {isResetMode && (
                    <>
                        Remember your password?{' '}
                        <Link href='/login' className='text-cyan-500 hover:text-cyan-400'>
                            Sign in
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
