import { Container } from '@/components/container';
import { Heading } from '@/components/heading';
import { Subheading } from '@/components/subheading';
import { Button } from '@/components/button';
import Link from 'next/link';
import { IconCheck, IconMail, IconArrowLeft } from '@tabler/icons-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Message Sent Successfully | SecPilot',
    description:
        'Thank you for contacting SecPilot. We have received your message and will get back to you soon.',
};

export default function ContactSuccessPage() {
    return (
        <main className='relative min-h-screen bg-neutral-950 flex items-center justify-center'>
            {/* Background effects */}
            <div className='fixed inset-0 pointer-events-none'>
                <div className='absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900' />
                <div className='absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl' />
                <div className='absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-500/4 rounded-full blur-3xl' />
            </div>

            <Container className='relative z-10 py-20 text-center'>
                <div className='max-w-md mx-auto'>
                    {/* Success Icon */}
                    <div className='w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30'>
                        <IconCheck className='w-10 h-10 text-emerald-400' />
                    </div>

                    <Heading className='mb-4 text-2xl'>Message Sent Successfully! 🎉</Heading>

                    <Subheading className='mb-8 text-neutral-400'>
                        Thank you for contacting SecPilot. We've received your message and will get
                        back to you within 24 hours.
                    </Subheading>

                    {/* What happens next */}
                    <div className='bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 mb-8 text-left'>
                        <h3 className='text-lg font-semibold mb-4 flex items-center'>
                            <IconMail className='w-5 h-5 mr-2 text-emerald-400' />
                            What happens next?
                        </h3>
                        <ul className='space-y-2 text-sm text-neutral-300'>
                            <li className='flex items-start'>
                                <span className='w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                                Our team will review your inquiry
                            </li>
                            <li className='flex items-start'>
                                <span className='w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                                You'll receive a personalized response within 24 hours
                            </li>
                            <li className='flex items-start'>
                                <span className='w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0'></span>
                                For urgent matters, we'll prioritize your request
                            </li>
                        </ul>
                    </div>

                    {/* Action buttons */}
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Button asChild variant='primary'>
                            <Link href='/'>
                                <IconArrowLeft className='w-4 h-4 mr-2' />
                                Return to Homepage
                            </Link>
                        </Button>
                        <Button asChild variant='outline'>
                            <Link href='/dashboard'>Go to Dashboard</Link>
                        </Button>
                    </div>

                    {/* Contact info */}
                    <div className='mt-8 pt-6 border-t border-neutral-800'>
                        <p className='text-xs text-neutral-500'>
                            Need immediate assistance? Email us directly at{' '}
                            <a
                                href='mailto:support@secpilot.io'
                                className='text-emerald-400 hover:text-emerald-300'
                            >
                                support@secpilot.io
                            </a>
                        </p>
                    </div>
                </div>
            </Container>
        </main>
    );
}
