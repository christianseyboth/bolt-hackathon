'use client';
import React, { useState } from 'react';
import { Container } from '@/components/container';
import { Heading } from '@/components/heading';
import { Subheading } from '@/components/subheading';
import { Button } from '@/components/button';
import { Grid } from '@/components/features/grid';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { IconMailFilled, IconPhone, IconMapPin, IconClock } from '@tabler/icons-react';
import { useToast } from '@/components/ui/use-toast';

export const ContactFormSimple = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inquiryType, setInquiryType] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        // Don't prevent default - let Netlify handle it
        setIsSubmitting(true);

        // If inquiry type is not selected, prevent submission
        if (!inquiryType) {
            e.preventDefault();
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select an inquiry type before submitting.',
            });
            setIsSubmitting(false);
            return;
        }

        // Show submitting toast
        toast({
            title: 'Submitting your message...',
            description: 'Please wait while we process your request.',
        });

        // Let the form submit naturally to Netlify
    };

    return (
        <Container className='py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 px-6'>
            {/* Hidden static form for Netlify detection */}
            <form name='contact' data-netlify='true' data-netlify-honeypot='bot-field' hidden>
                <input type='text' name='name' />
                <input type='email' name='email' />
                <input type='text' name='company' />
                <input type='text' name='subject' />
                <textarea name='message'></textarea>
            </form>

            {/* Left Side - Contact Info */}
            <div className='space-y-8'>
                <div>
                    <Heading className='text-left text-2xl lg:text-3xl mt-12'>
                        Let&apos;s Secure Your Email Together
                    </Heading>
                    <Subheading className='text-left text-neutral-400 mt-4'>
                        Ready to protect your organization from email threats? Our cybersecurity
                        experts are standing by to help you choose the right email security solution
                        and get started with advanced threat protection.
                    </Subheading>
                </div>

                {/* Contact Methods */}
                <div className='space-y-6'>
                    <div className='flex items-start space-x-4'>
                        <div className='p-2 bg-emerald-500/20 rounded-lg'>
                            <IconMailFilled className='h-5 w-5 text-emerald-400' />
                        </div>
                        <div>
                            <p className='text-sm font-medium text-neutral-200'>Email Support</p>
                            <a
                                href='mailto:support@secpilot.io'
                                className='text-sm text-emerald-400 hover:text-emerald-300 transition-colors'
                            >
                                support@secpilot.io
                            </a>
                            <p className='text-xs text-neutral-500 mt-1'>
                                Typical response within 2 hours
                            </p>
                        </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                        <div className='p-2 bg-blue-500/20 rounded-lg'>
                            <IconPhone className='h-5 w-5 text-blue-400' />
                        </div>
                        <div>
                            <p className='text-sm font-medium text-neutral-200'>Phone Support</p>
                            <p className='text-sm text-neutral-400'>+1 (555) 123-7890</p>
                            <p className='text-xs text-neutral-500 mt-1'>
                                Available for Team & Enterprise plans
                            </p>
                        </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                        <div className='p-2 bg-purple-500/20 rounded-lg'>
                            <IconClock className='h-5 w-5 text-purple-400' />
                        </div>
                        <div>
                            <p className='text-sm font-medium text-neutral-200'>Support Hours</p>
                            <p className='text-sm text-neutral-400'>
                                Monday - Friday, 9AM - 6PM EST
                            </p>
                            <p className='text-xs text-neutral-500 mt-1'>
                                24/7 emergency support for Enterprise
                            </p>
                        </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                        <div className='p-2 bg-amber-500/20 rounded-lg'>
                            <IconMapPin className='h-5 w-5 text-amber-400' />
                        </div>
                        <div>
                            <p className='text-sm font-medium text-neutral-200'>Headquarters</p>
                            <p className='text-sm text-neutral-400'>San Francisco, CA</p>
                            <p className='text-xs text-neutral-500 mt-1'>
                                Serving customers globally
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className='pt-6 border-t border-neutral-800'>
                    <p className='text-xs text-neutral-500 mb-3'>
                        Trusted by security professionals
                    </p>
                    <div className='flex items-center space-x-6 text-xs'>
                        <div className='flex items-center space-x-2'>
                            <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                            <span className='text-neutral-400'>SOC2 Ready</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                            <span className='text-neutral-400'>HIPAA Ready</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                            <span className='text-neutral-400'>GDPR Compliant</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className='flex flex-col items-start gap-6 max-w-xl w-full mx-auto bg-gradient-to-b from-neutral-900/50 to-neutral-950/50 p-8 lg:p-10 rounded-2xl relative overflow-hidden border border-neutral-800 backdrop-blur-sm'>
                <Grid size={20} />

                <div className='w-full relative z-20'>
                    <h3 className='text-lg font-semibold text-white mb-2'>Send us a message</h3>
                    <p className='text-sm text-neutral-400 mb-6'>
                        Tell us about your email security needs and we&apos;ll get back to you
                        within 24 hours.
                    </p>
                </div>

                <form
                    name='contact'
                    method='POST'
                    action='/contact/success'
                    onSubmit={handleSubmit}
                    className='w-full relative z-20 space-y-4'
                >
                    <input type='hidden' name='form-name' value='contact' />
                    <input type='hidden' name='subject' value={inquiryType} />

                    {/* Honeypot field */}
                    <div style={{ display: 'none' }}>
                        <label>
                            Don't fill this out if you're human: <input name='bot-field' />
                        </label>
                    </div>

                    <div className='w-full'>
                        <label
                            className='text-neutral-300 text-sm font-medium mb-2 inline-block'
                            htmlFor='name'
                        >
                            Full Name *
                        </label>
                        <input
                            id='name'
                            name='name'
                            type='text'
                            required
                            placeholder='John Smith'
                            className='h-11 px-4 w-full rounded-lg text-sm bg-neutral-900/50 border border-neutral-700 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200'
                        />
                    </div>

                    <div className='w-full'>
                        <label
                            className='text-neutral-300 text-sm font-medium mb-2 inline-block'
                            htmlFor='email'
                        >
                            Business Email *
                        </label>
                        <input
                            id='email'
                            name='email'
                            type='email'
                            required
                            placeholder='john@company.com'
                            className='h-11 px-4 w-full rounded-lg text-sm bg-neutral-900/50 border border-neutral-700 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200'
                        />
                    </div>

                    <div className='w-full'>
                        <label
                            className='text-neutral-300 text-sm font-medium mb-2 inline-block'
                            htmlFor='company'
                        >
                            Company Name
                        </label>
                        <input
                            id='company'
                            name='company'
                            type='text'
                            placeholder='Acme Corporation'
                            className='h-11 px-4 w-full rounded-lg text-sm bg-neutral-900/50 border border-neutral-700 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200'
                        />
                    </div>

                    <div className='w-full'>
                        <label
                            className='text-neutral-300 text-sm font-medium mb-2 inline-block'
                            htmlFor='subject-select'
                        >
                            Inquiry Type *
                        </label>

                        <Select onValueChange={setInquiryType} value={inquiryType}>
                            <SelectTrigger className='w-full h-11 bg-neutral-900/50 border border-neutral-700 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200'>
                                <SelectValue placeholder='Select an option' />
                            </SelectTrigger>
                            <SelectContent className='bg-neutral-900 border-neutral-700'>
                                <SelectItem
                                    value='general'
                                    className='text-white hover:bg-neutral-800'
                                >
                                    General Information
                                </SelectItem>
                                <SelectItem
                                    value='sales'
                                    className='text-white hover:bg-neutral-800'
                                >
                                    Sales & Pricing
                                </SelectItem>
                                <SelectItem
                                    value='support'
                                    className='text-white hover:bg-neutral-800'
                                >
                                    Technical Support
                                </SelectItem>
                                <SelectItem
                                    value='enterprise'
                                    className='text-white hover:bg-neutral-800'
                                >
                                    Enterprise Solutions
                                </SelectItem>
                                <SelectItem
                                    value='security'
                                    className='text-white hover:bg-neutral-800'
                                >
                                    Security Question
                                </SelectItem>
                                <SelectItem
                                    value='integration'
                                    className='text-white hover:bg-neutral-800'
                                >
                                    Integration Help
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='w-full'>
                        <label
                            className='text-neutral-300 text-sm font-medium mb-2 inline-block'
                            htmlFor='message'
                        >
                            Message *
                        </label>
                        <textarea
                            id='message'
                            name='message'
                            rows={4}
                            required
                            placeholder='Tell us about your email security needs, team size, or any specific requirements...'
                            className='px-4 pt-3 w-full rounded-lg text-sm bg-neutral-900/50 border border-neutral-700 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 resize-none'
                        />
                    </div>

                    <Button
                        type='submit'
                        disabled={isSubmitting || !inquiryType}
                        variant='primary'
                        className='w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white border-0 h-11 transition-all duration-200'
                    >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                </form>

                <p className='text-xs text-neutral-500 text-center w-full relative z-20'>
                    By submitting this form, you agree to our privacy policy. We&apos;ll only use
                    your information to respond to your inquiry.
                </p>
            </div>
        </Container>
    );
};
