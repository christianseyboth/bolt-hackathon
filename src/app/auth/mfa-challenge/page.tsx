'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';
import { verifyMFA, verifyOAuthMFA } from '@/app/auth/actions';

function MFAChallengeContent() {
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const isOAuth = searchParams.get('oauth') === 'true';

    const handleVerifyMFA = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        if (!isOAuth && !password) {
            setShowPasswordInput(true);
            setError(
                'For security, please re-enter your password along with your authenticator code'
            );
            return;
        }

        if (!code.trim()) {
            setError('Please enter your authenticator code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('email', email);
            if (!isOAuth) {
                formData.append('password', password);
            }
            formData.append('code', code.replace(/\s/g, ''));

            const result = isOAuth ? await verifyOAuthMFA(formData) : await verifyMFA(formData);

            if (result?.error) {
                setError(result.error);
                setCode('');
                setIsLoading(false);
                return;
            }

            // Success - the server action will redirect to dashboard
        } catch (err) {
            console.error('MFA verification error:', err);

            // Check if this is a redirect error (which is expected on success)
            const errorString = String(err);
            const isRedirect =
                (err &&
                    typeof err === 'object' &&
                    'digest' in err &&
                    typeof err.digest === 'string' &&
                    err.digest.includes('NEXT_REDIRECT')) ||
                errorString.includes('NEXT_REDIRECT') ||
                errorString.includes('redirect');

            if (isRedirect) {
                console.log('MFA verification successful - redirect detected');
                // Don't show error, let the redirect happen
                throw err;
            }

            setError('An unexpected error occurred. Please try again.');
            setCode('');
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.push('/auth/login');
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-background p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <div className='flex justify-center mb-4'>
                        <Shield className='h-12 w-12 text-primary' />
                    </div>
                    <CardTitle className='text-2xl'>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        {isOAuth
                            ? 'Enter the 6-digit code from your authenticator app'
                            : "For security, you'll need to re-enter your password and provide your authenticator code"}
                        {email && (
                            <span className='block mt-2 font-medium text-foreground'>
                                Signing in as: {email}
                                {isOAuth && (
                                    <span className='block text-sm text-muted-foreground'>
                                        (OAuth Account)
                                    </span>
                                )}
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerifyMFA} className='space-y-4'>
                        {showPasswordInput && !isOAuth && (
                            <div className='space-y-2'>
                                <label htmlFor='password' className='text-sm font-medium'>
                                    Password
                                </label>
                                <Input
                                    id='password'
                                    type='password'
                                    placeholder='Enter your password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete='current-password'
                                    required
                                />
                            </div>
                        )}

                        <div className='space-y-2'>
                            <label htmlFor='code' className='text-sm font-medium'>
                                Authenticator Code
                            </label>
                            <Input
                                id='code'
                                type='text'
                                placeholder='000000'
                                value={code}
                                onChange={(e) =>
                                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                }
                                className='text-center text-lg tracking-widest'
                                maxLength={6}
                                autoComplete='one-time-code'
                                autoFocus={!showPasswordInput}
                            />
                        </div>

                        {error && (
                            <Alert variant='destructive'>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className='space-y-2'>
                            <Button
                                type='submit'
                                disabled={
                                    isLoading ||
                                    code.length !== 6 ||
                                    (showPasswordInput && !isOAuth && !password)
                                }
                                className='w-full'
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Code'
                                )}
                            </Button>

                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleBackToLogin}
                                className='w-full'
                                disabled={isLoading}
                            >
                                Back to Login
                            </Button>
                        </div>
                    </form>

                    <div className='mt-6 text-center text-sm text-muted-foreground'>
                        <p>Can't access your authenticator?</p>
                        <p>Contact support for assistance.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className='min-h-screen flex items-center justify-center bg-background p-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <div className='flex justify-center mb-4'>
                        <Shield className='h-12 w-12 text-primary' />
                    </div>
                    <CardTitle className='text-2xl'>Two-Factor Authentication</CardTitle>
                    <CardDescription>Loading...</CardDescription>
                </CardHeader>
                <CardContent className='flex justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin' />
                </CardContent>
            </Card>
        </div>
    );
}

export default function MFAChallenge() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <MFAChallengeContent />
        </Suspense>
    );
}
