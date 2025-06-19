'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DeleteAccountSection } from '@/components/dashboard/delete-account-section';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    IconUser,
    IconShield,
    IconMail,
    IconKey,
    IconEye,
    IconAlertTriangle,
    IconCopy,
} from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { AccountProfile } from '@/components/profile/account-profile';
import { ApiKeyManagement } from '@/components/profile/api-key-management';
import { SecuritySettings } from '@/components/profile/security-settings';
import { getApiBaseUrl, getApiDocumentationExample } from '@/lib/api-config';

export default function ProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('account');
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Don't render tabs until mounted to prevent hydration mismatch
    if (!isMounted) {
        return (
            <>
                <DashboardHeader
                    heading='Profile & Settings'
                    subheading='Manage your account, security, and preferences'
                />
                <div className='mt-6 animate-pulse'>
                    <div className='h-10 bg-neutral-800 rounded mb-6'></div>
                    <div className='h-96 bg-neutral-800 rounded'></div>
                </div>
            </>
        );
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied to clipboard',
            description: 'The text has been copied to your clipboard.',
        });
    };

    return (
        <>
            <DashboardHeader
                heading='Profile & Settings'
                subheading='Manage your account, security, and preferences'
            />

            <div className='mt-6'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                    <TabsList className='grid w-full grid-cols-2 md:grid-cols-4 bg-neutral-800/50 '>
                        <TabsTrigger
                            value='account'
                            className='cursor-pointer flex items-center gap-1 md:gap-2'
                        >
                            <IconUser className='h-4 w-4' />
                            <span className='hidden sm:inline'>Account</span>
                            <span className='sm:hidden'>Acc</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='security'
                            className='cursor-pointer flex items-center gap-1 md:gap-2'
                        >
                            <IconShield className='h-4 w-4' />
                            <span className='hidden sm:inline'>Security</span>
                            <span className='sm:hidden'>Sec</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='email'
                            className='cursor-pointer flex items-center gap-1 md:gap-2'
                        >
                            <IconMail className='h-4 w-4' />
                            <span className='hidden sm:inline'>Email</span>
                            <span className='sm:hidden'>Mail</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value='api'
                            className='cursor-pointer flex items-center gap-1 md:gap-2'
                        >
                            <IconKey className='h-4 w-4' />
                            <span>API</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Account Tab - Now uses real AccountProfile component */}
                    <TabsContent value='account' className='space-y-6'>
                        <Card className='border border-neutral-800 bg-neutral-900'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <IconUser className='h-5 w-5' />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AccountProfile />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value='security' className='space-y-6'>
                        <SecuritySettings />

                        <DeleteAccountSection />
                    </TabsContent>

                    {/* Email Tab */}
                    <TabsContent value='email' className='space-y-6'>
                        <Card
                            className='border border-neutral-800 bg-neutral-900'
                            data-tour='email-forwarding'
                        >
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <IconMail className='h-5 w-5' />
                                    Email Forwarding Setup
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
                                    <h4 className='font-medium text-blue-400 mb-2'>How it works</h4>
                                    <p className='text-sm text-neutral-300'>
                                        Forward your emails to our analysis engine. We'll scan them
                                        for threats and send you detailed reports.
                                    </p>
                                </div>

                                <div>
                                    <Label>Your Unique Forwarding Address</Label>
                                    <div className='flex gap-2 mt-1'>
                                        <Input
                                            value='check@secpilot.io'
                                            disabled
                                            className='flex-1'
                                        />
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => copyToClipboard('check@secpilot.io')}
                                        >
                                            <IconCopy className='h-4 w-4' />
                                        </Button>
                                    </div>
                                    <p className='text-xs text-neutral-400 mt-1'>
                                        Set up email forwarding rules to send suspicious emails here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preferences Section - Hidden for now as lingo implementation failed */}
                        {/*
                        <Card className='border border-neutral-800 bg-neutral-900'>
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label>Language & Region</Label>
                                    <Select defaultValue='en'>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='en'>English</SelectItem>
                                            <SelectItem value='de'>German</SelectItem>
                                            <SelectItem value='fr'>French</SelectItem>
                                            <SelectItem value='es'>Spanish</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label>Timezone</Label>
                                    <Select defaultValue='utc'>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='utc'>UTC</SelectItem>
                                            <SelectItem value='est'>Eastern Time</SelectItem>
                                            <SelectItem value='pst'>Pacific Time</SelectItem>
                                            <SelectItem value='cet'>
                                                Central European Time
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                        */}
                    </TabsContent>

                    {/* API Tab */}
                    <TabsContent value='api' className='space-y-6'>
                        <div className='p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6'>
                            <h4 className='font-medium text-blue-400 mb-2'>SecPilot API</h4>
                            <p className='text-sm text-neutral-300 mb-3'>
                                Use our API to integrate SecPilot email security into your
                                applications and workflows.{' '}
                                <span className='text-yellow-400 font-medium'>
                                    Requires Team plan.
                                </span>
                            </p>
                            <div className='text-xs text-neutral-400'>
                                <div>• Retrieve email analysis results</div>
                                <div>• Access account information</div>
                                <div>• Monitor API usage statistics</div>
                                <div>• Build custom dashboards</div>
                            </div>
                        </div>

                        <ApiKeyManagement />

                        <Card className='border border-neutral-800 bg-neutral-900'>
                            <CardHeader>
                                <CardTitle>API Documentation</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                {/* API Base Info */}
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                                    <div>
                                        <Label className='text-neutral-400'>Base URL</Label>
                                        <code className='block bg-neutral-800 p-2 rounded mt-1 font-mono text-xs'>
                                            {getApiBaseUrl()}/api/v1
                                        </code>
                                    </div>
                                    <div>
                                        <Label className='text-neutral-400'>Authentication</Label>
                                        <code className='block bg-neutral-800 p-2 rounded mt-1 font-mono text-xs'>
                                            Authorization: Bearer YOUR_API_KEY
                                        </code>
                                    </div>
                                </div>

                                {/* Available Endpoints */}
                                <div className='space-y-4'>
                                    <h4 className='font-medium text-neutral-200'>
                                        Available Endpoints
                                    </h4>

                                    {/* Email Analyses Endpoint */}
                                    <div className='border border-neutral-700 rounded-lg p-4 space-y-3'>
                                        <div className='flex items-center gap-2'>
                                            <span className='bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono'>
                                                GET
                                            </span>
                                            <code className='text-sm font-mono'>/analyses</code>
                                        </div>
                                        <p className='text-sm text-neutral-400'>
                                            Get email security analysis results with filtering and
                                            pagination
                                        </p>
                                        <details className='text-xs'>
                                            <summary className='cursor-pointer text-blue-400 hover:text-blue-300'>
                                                View example
                                            </summary>
                                            <pre className='bg-neutral-800 p-3 rounded mt-2 overflow-x-auto font-mono text-xs'>
                                                {getApiDocumentationExample(
                                                    '/analyses',
                                                    'GET',
                                                    '?threat_level=critical&limit=10'
                                                )}
                                            </pre>
                                        </details>
                                    </div>

                                    {/* Account Info Endpoint */}
                                    <div className='border border-neutral-700 rounded-lg p-4 space-y-3'>
                                        <div className='flex items-center gap-2'>
                                            <span className='bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono'>
                                                GET
                                            </span>
                                            <code className='text-sm font-mono'>/account</code>
                                        </div>
                                        <p className='text-sm text-neutral-400'>
                                            Get account information and subscription details
                                        </p>
                                        <details className='text-xs'>
                                            <summary className='cursor-pointer text-blue-400 hover:text-blue-300'>
                                                View example
                                            </summary>
                                            <pre className='bg-neutral-800 p-3 rounded mt-2 overflow-x-auto font-mono text-xs'>
                                                {getApiDocumentationExample('/account')}
                                            </pre>
                                        </details>
                                    </div>

                                    {/* Usage Stats Endpoint */}
                                    <div className='border border-neutral-700 rounded-lg p-4 space-y-3'>
                                        <div className='flex items-center gap-2'>
                                            <span className='bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono'>
                                                GET
                                            </span>
                                            <code className='text-sm font-mono'>/usage</code>
                                        </div>
                                        <p className='text-sm text-neutral-400'>
                                            Get API usage statistics and rate limit information
                                        </p>
                                        <details className='text-xs'>
                                            <summary className='cursor-pointer text-blue-400 hover:text-blue-300'>
                                                View example
                                            </summary>
                                            <pre className='bg-neutral-800 p-3 rounded mt-2 overflow-x-auto font-mono text-xs'>
                                                {getApiDocumentationExample(
                                                    '/usage',
                                                    'GET',
                                                    '?period=7d'
                                                )}
                                            </pre>
                                        </details>
                                    </div>
                                </div>

                                {/* Rate Limits */}
                                <div className='p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
                                    <h4 className='font-medium text-yellow-400 mb-2'>
                                        Rate Limits & Plan Requirements
                                    </h4>
                                    <div className='text-sm text-neutral-300 space-y-1'>
                                        <div>
                                            • <span className='text-red-400'>Solo Plan:</span> API
                                            access not available
                                        </div>
                                        <div>
                                            •{' '}
                                            <span className='text-red-400'>Entrepreneur Plan:</span>{' '}
                                            API access not available
                                        </div>
                                        <div>
                                            • <span className='text-green-400'>Team Plan:</span> 100
                                            requests/hour
                                        </div>
                                    </div>
                                </div>

                                {/* Copy Base URL Button */}
                                <div className='pt-4 flex gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => copyToClipboard(`${getApiBaseUrl()}/api/v1`)}
                                    >
                                        <IconCopy className='h-4 w-4 mr-1' />
                                        Copy Base URL
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
