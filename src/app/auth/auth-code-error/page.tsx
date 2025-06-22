import React from 'react';
import { AmbientColor } from '@/components/AmbientColor';
import { Container } from '@/components/Container';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Authentication Error | Proactiv',
    description: 'Authentication error occurred',
};

export default async function AuthCodeErrorPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; error_description?: string; error_code?: string }>;
}) {
    const searchParamsData = await searchParams;
    const error = searchParamsData.error || 'Unknown error';
    const errorDescription =
        searchParamsData.error_description || 'An unexpected error occurred during authentication.';
    const errorCode = searchParamsData.error_code || '';

    return (
        <div className='relative overflow-hidden min-h-screen flex flex-col items-center justify-center'>
            <AmbientColor />
            <Container className='flex flex-col items-center'>
                <div className='mb-8'>
                    <Logo />
                </div>
                <div className='w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-xl p-8 backdrop-blur-sm'>
                    <div className='space-y-6 text-center'>
                        <div className='space-y-2'>
                            <h1 className='text-2xl font-bold text-red-400'>
                                Authentication Error
                            </h1>
                            <p className='text-sm text-neutral-400'>
                                We encountered an issue while trying to sign you in.
                            </p>
                        </div>

                        <div className='bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md text-sm text-left'>
                            <div className='font-medium mb-2'>Error Details:</div>
                            <div className='space-y-1 text-xs'>
                                {errorCode && (
                                    <div>
                                        <strong>Code:</strong> {errorCode}
                                    </div>
                                )}
                                <div>
                                    <strong>Type:</strong> {error}
                                </div>
                                <div>
                                    <strong>Description:</strong>{' '}
                                    {decodeURIComponent(errorDescription)}
                                </div>
                            </div>
                        </div>

                        {errorDescription.includes('Database error saving new user') && (
                            <div className='bg-blue-900/30 border border-blue-800 text-blue-400 px-4 py-3 rounded-md text-sm text-left'>
                                <div className='font-medium mb-2'>What does this mean?</div>
                                <div className='space-y-2 text-xs'>
                                    <p>
                                        This error typically occurs when the database schema isn't
                                        properly configured for new user registration.
                                    </p>
                                    <p>
                                        The administrator needs to set up the user profiles table
                                        and triggers in Supabase.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className='space-y-3'>
                            <Link href='/login'>
                                <Button className='w-full'>Try Again</Button>
                            </Link>
                            <Link href='/'>
                                <Button
                                    variant='outline'
                                    className='w-full bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                                >
                                    Go Home
                                </Button>
                            </Link>
                        </div>

                        <div className='text-xs text-neutral-500'>
                            If this problem persists, please contact support.
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
