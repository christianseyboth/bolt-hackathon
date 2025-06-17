'use client';
import React, { useState, useTransition } from 'react';
import { Container } from './container';
import { Logo } from './logo';
import {
    IconBrandGithub,
    IconBrandGithubFilled,
    IconBrandGoogleFilled,
    IconLoader2,
} from '@tabler/icons-react';
import { Button } from './button';
import { motion } from 'motion/react';
import { signInWithOAuth } from '@/app/auth/actions';

export const Register = () => {
    const [isClicked, setIsClicked] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Form submitted
        // You can add email registration logic here
    };

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

    return (
        <Container className='h-screen max-w-lg mx-auto flex flex-col items-center justify-center'>
            <Logo />
            <h1 className='text-xl md:text-4xl font-bold my-4'>Welcome to Proactiv</h1>

            {/* Error Message */}
            {formError && (
                <div className='bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md text-sm mb-4 w-full max-w-md'>
                    {formError}
                </div>
            )}

            <div className='flex flex-col sm:flex-row gap-4 w-full'>
                <button
                    className='flex flex-1 justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset] disabled:opacity-50'
                    onClick={() => handleSocialAuth('github')}
                    disabled={isPending}
                >
                    {isPending ? (
                        <IconLoader2 className='h-4 w-4 text-black animate-spin' />
                    ) : (
                        <IconBrandGithubFilled className='h-4 w-4 text-black' />
                    )}
                    <span className='text-sm'>Login with GitHub</span>
                </button>
                <button
                    className='flex flex-1 justify-center space-x-2 items-center bg-white px-4 py-3 rounded-md text-black hover:bg-white/80 transition duration-200 shadow-[0px_1px_0px_0px_#00000040_inset] disabled:opacity-50'
                    onClick={() => handleSocialAuth('google')}
                    disabled={isPending}
                >
                    {isPending ? (
                        <IconLoader2 className='h-4 w-4 text-black animate-spin' />
                    ) : (
                        <IconBrandGoogleFilled className='h-4 w-4 text-black' />
                    )}
                    <span className='text-sm'>Login with Google</span>
                </button>
            </div>

            <div className='h-px bg-neutral-800 w-full my-6' />

            <form onSubmit={handleSubmit} className='w-full'>
                <motion.input
                    initial={{
                        height: '0px',
                        opacity: 0,
                        marginBottom: '0px',
                    }}
                    animate={{
                        height: isClicked ? '40px' : '0px',
                        opacity: isClicked ? 1 : 0,
                        marginBottom: isClicked ? '10px' : '0px',
                    }}
                    type='email'
                    name='email'
                    placeholder='contact@aceternity.com'
                    className='h-10 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-800'
                    required={isClicked}
                />
                <Button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        if (!isClicked) {
                            e.preventDefault();
                            setIsClicked(true);
                            return;
                        }
                    }}
                    type={isClicked ? 'submit' : 'button'}
                    variant='muted'
                    className='w-full py-3'
                    disabled={isPending}
                >
                    <span className='text-sm'>Continue with Email</span>
                </Button>
            </form>
        </Container>
    );
};
