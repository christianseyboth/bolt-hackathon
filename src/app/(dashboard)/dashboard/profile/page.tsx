'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DeleteAccountSection } from '@/components/dashboard/delete-account-section';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
    IconBell,
    IconKey,
    IconEye,
    IconDownload,
    IconCreditCard,
    IconAlertTriangle,
    IconCheck,
    IconCopy,
    IconRefresh,
} from '@tabler/icons-react';

// Mock user data
const mockUser = {
    name: 'Max Mustermann',
    email: 'max@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    authMethod: 'email',
    emailVerified: true,
    twoFactorEnabled: false,
    lastLogin: '2024-01-15T10:30:00Z',
    accountCreated: '2023-12-01T00:00:00Z',
    subscription: 'pro',
    forwardingEmails: ['security@company.com'],
    apiKey: 'sp_live_1234567890abcdef',
};

export default function ProfilePage() {
    const [user, setUser] = useState(mockUser);
    const [isEditing, setIsEditing] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Add toast notification here
    };

    return (
        <>
            <DashboardHeader
                heading="Profile & Settings"
                subheading="Manage your account, security, and preferences"
                user={user}
            />

            <div className="mt-6">
                <Tabs defaultValue="account" className="w-full">
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

                    {/* Account Tab */}
                    <TabsContent value="account" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border border-neutral-800 bg-neutral-900">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <IconUser className="h-5 w-5" />
                                        Profile Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="text-lg">
                                                {user.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-2">
                                            <Button variant="outline" size="sm">
                                                Change Avatar
                                            </Button>
                                            <div className="flex gap-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    {user.authMethod === 'email' ? 'Email' : 'OAuth'}
                                                </Badge>
                                                {user.emailVerified && (
                                                    <Badge variant="default" className="text-xs bg-emerald-600">
                                                        <IconCheck className="h-3 w-3 mr-1" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                defaultValue={user.name}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                value={user.email}
                                                disabled
                                                type="email"
                                            />
                                            <p className="text-xs text-neutral-400 mt-1">
                                                Email cannot be changed. Contact support if needed.
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor="company">Company (Optional)</Label>
                                            <Input
                                                id="company"
                                                placeholder="Your company name"
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button onClick={() => setIsEditing(false)}>
                                                    Save Changes
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                Edit Profile
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border border-neutral-800 bg-neutral-900">
                                <CardHeader>
                                    <CardTitle>Account Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <Label className="text-neutral-400">Account Created</Label>
                                            <p>{formatDate(user.accountCreated)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-neutral-400">Last Login</Label>
                                            <p>{formatDate(user.lastLogin)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-neutral-400">Subscription</Label>
                                            <Badge variant="secondary" className="mt-1">
                                                {user.subscription.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div>
                                            <Label className="text-neutral-400">Auth Method</Label>
                                            <p className="capitalize">{user.authMethod} Login</p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-neutral-800 my-4"></div>

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
                        </div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <Card className="border border-neutral-800 bg-neutral-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconShield className="h-5 w-5" />
                                    Security Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Two-Factor Authentication</Label>
                                        <p className="text-sm text-neutral-400">
                                            Add an extra layer of security to your account
                                        </p>
                                    </div>
                                    <Button
                                        variant={user.twoFactorEnabled ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setUser({ ...user, twoFactorEnabled: !user.twoFactorEnabled })}
                                    >
                                        {user.twoFactorEnabled ? 'Enabled' : 'Enable'}
                                    </Button>
                                </div>

                                <div className="h-px bg-neutral-800"></div>

                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="password"
                                            value="••••••••••••"
                                            disabled
                                            className="flex-1"
                                        />
                                        <Button variant="outline">Change</Button>
                                    </div>
                                    <p className="text-xs text-neutral-400">
                                        Last changed: 30 days ago
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Email Tab */}
                    <TabsContent value="email" className="space-y-6">
                        <Card className="border border-neutral-800 bg-neutral-900">
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
                                            value={`${user.email.split('@')[0]}-security@secpilot.ai`}
                                            disabled
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                copyToClipboard(
                                                    `${user.email.split('@')[0]}-security@secpilot.ai`
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
                        <Card className="border border-neutral-800 bg-neutral-900">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconKey className="h-5 w-5" />
                                    API Access
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                    <h4 className="font-medium text-amber-400 mb-2">
                                        <IconAlertTriangle className="h-4 w-4 inline mr-1" />
                                        Keep your API key secure
                                    </h4>
                                    <p className="text-sm text-neutral-300">
                                        Never share your API key publicly. It provides full access to your account data.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>API Key</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={user.apiKey}
                                            disabled
                                            className="flex-1 font-mono text-sm"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                        >
                                            <IconEye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(user.apiKey)}
                                        >
                                            <IconCopy className="h-4 w-4" />
                                        </Button>
                                    </div>
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
