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
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AccountProfile } from '@/components/profile/account-profile';
import { ApiKeyManagement } from '@/components/profile/api-key-management';
import { SecuritySettings } from '@/components/profile/security-settings';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('account');
    const [isMounted, setIsMounted] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    // Prevent hydration mismatch and fetch user data
    useEffect(() => {
        setIsMounted(true);
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
        fetchUser();
    }, [searchParams]);

    const fetchUser = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                setUser(authUser);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    // Don't render tabs until mounted to prevent hydration mismatch
    if (!isMounted) {
        return (
            <>
                <DashboardHeader
                    heading="Profile & Settings"
                    subheading="Manage your account, security, and preferences"
                    user={user}
                />
                <div className="mt-6 animate-pulse">
                    <div className="h-10 bg-neutral-800 rounded mb-6"></div>
                    <div className="h-96 bg-neutral-800 rounded"></div>
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
                heading="Profile & Settings"
                subheading="Manage your account, security, and preferences"
                user={user}
            />

            <div className="mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-neutral-800/50">
                        <TabsTrigger value="account" className="flex items-center gap-2">
                            <IconUser className="h-4 w-4" />
                            Account
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <IconShield className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex items-center gap-2">
                            <IconMail className="h-4 w-4" />
                            Email
                        </TabsTrigger>
                        <TabsTrigger value="api" className="flex items-center gap-2">
                            <IconKey className="h-4 w-4" />
                            API
                        </TabsTrigger>
                    </TabsList>

                    {/* Account Tab - Now uses real AccountProfile component */}
                    <TabsContent value="account" className="space-y-6">
                        <Card className="border border-neutral-800 bg-neutral-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconUser className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AccountProfile />
                            </CardContent>
                        </Card>

                        {/* Additional Settings Card */}
                        <Card className="border border-neutral-800 bg-neutral-900">
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Language & Region</Label>
                                    <Select defaultValue="en">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Timezone</Label>
                                    <Select defaultValue="utc">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="utc">UTC</SelectItem>
                                            <SelectItem value="est">Eastern Time</SelectItem>
                                            <SelectItem value="pst">Pacific Time</SelectItem>
                                            <SelectItem value="cet">Central European Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <SecuritySettings />
                    </TabsContent>

                    {/* Email Tab */}
                    <TabsContent value="email" className="space-y-6">
                        <Card className="border border-neutral-800 bg-neutral-900" data-tour="email-forwarding">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconMail className="h-5 w-5" />
                                    Email Forwarding Setup
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <h4 className="font-medium text-blue-400 mb-2">How it works</h4>
                                    <p className="text-sm text-neutral-300">
                                        Forward your emails to our analysis engine. We'll scan them for
                                        threats and send you detailed reports.
                                    </p>
                                </div>

                                <div>
                                    <Label>Your Unique Forwarding Address</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            value={user ? `${user.email?.split('@')[0]}-security@proactiv.ai` : 'Loading...'}
                                            disabled
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                copyToClipboard(
                                                    `${user?.email?.split('@')[0]}-security@proactiv.ai`
                                                )
                                            }
                                        >
                                            <IconCopy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Set up email forwarding rules to send suspicious emails here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* API Tab */}
                    <TabsContent value="api" className="space-y-6">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
                            <h4 className="font-medium text-blue-400 mb-2">ProActiv API</h4>
                            <p className="text-sm text-neutral-300 mb-3">
                                Use our API to integrate ProActiv email security into your applications and workflows.
                            </p>
                            <div className="text-xs text-neutral-400">
                                <div>• Analyze emails programmatically</div>
                                <div>• Bulk process email security scans</div>
                                <div>• Integrate with security tools</div>
                                <div>• Build custom dashboards</div>
                            </div>
                        </div>

                        <ApiKeyManagement />

                        <Card className="border border-neutral-800 bg-neutral-900">
                            <CardHeader>
                                <CardTitle>API Documentation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-neutral-400">Base URL</Label>
                                        <code className="block bg-neutral-800 p-2 rounded mt-1">
                                            https://api.proactiv.ai/v1
                                        </code>
                                    </div>
                                    <div>
                                        <Label className="text-neutral-400">Authentication</Label>
                                        <code className="block bg-neutral-800 p-2 rounded mt-1">
                                            Authorization: Bearer YOUR_API_KEY
                                        </code>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button variant="outline" size="sm">
                                        View Full Documentation
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-6">
                    <DeleteAccountSection />
                </div>
            </div>
        </>
    );
}
