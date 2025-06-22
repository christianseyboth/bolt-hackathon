import React from 'react';
import { AmbientColor } from '@/components/AmbientColor';
import { Container } from '@/components/Container';
import { Logo } from '@/components/Logo';
import { AuthForm } from '@/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | SecPilot | AI-Powered Email Security',
    description:
        'Log in to your SecPilot account to access your email security dashboard and settings.',
};

export default function LoginPage() {
    return (
        <div className='relative overflow-hidden min-h-screen flex flex-col items-center justify-center'>
            <AmbientColor />
            <Container className='flex flex-col items-center'>
                <div className='mb-8'>
                    <Logo />
                </div>
                <div className='w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-xl p-8 backdrop-blur-sm'>
                    <AuthForm mode='login' />
                </div>
            </Container>
        </div>
    );
}
