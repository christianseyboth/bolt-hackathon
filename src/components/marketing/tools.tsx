'use client';
'use i18n';
import { motion } from 'motion/react';
import React from 'react';
import { FeatureIconContainer } from '@/components/features/feature-icon-container';
import { Heading } from '@/components/heading';
import { Subheading } from '@/components/subheading';
import { StickyScroll } from '@/components/ui/sticky-scroll';
import { IconTerminal, IconMail, IconChartBar } from '@tabler/icons-react';

export const Tools = () => {
    const content = [
        {
            title: 'Security Command Center',
            description:
                'Your centralized dashboard for monitoring email threats across your entire organization. Real-time threat detection, incident response workflows, and comprehensive security posture management in one unified interface.',
            content: (
                <PlatformContainer>
                    <SecurityDashboardMockup />
                </PlatformContainer>
            ),
        },
        {
            title: 'API Integration & Webhooks',
            description:
                'Seamlessly integrate SecPilot with your existing security infrastructure. Access real-time threat data via REST API, configure webhooks for instant alerts, and connect with SIEM systems, Slack, Teams, and other enterprise tools.',
            content: (
                <PlatformContainer>
                    <APIIntegrationMockup />
                </PlatformContainer>
            ),
        },
        {
            title: 'Detailed Security Reports & Analytics',
            description:
                'Comprehensive reporting suite with executive summaries, technical deep-dives, and compliance reports. Track security trends, measure threat landscape changes, and demonstrate ROI with detailed analytics and custom report generation.',
            content: (
                <PlatformContainer>
                    <ReportingMockup />
                </PlatformContainer>
            ),
        },
    ];

    return (
        <div className='w-full relative h-full pt-20 md:pt-40'>
            <div className='px-6'>
                <FeatureIconContainer className='flex justify-center items-center overflow-hidden'>
                    <div className='relative'>
                        <IconMail className='h-6 w-6 text-emerald-800' />
                    </div>
                </FeatureIconContainer>
                <Heading className='mt-4'>Email Security Software for Every Business Size</Heading>
                <Subheading>
                    From individual professionals to enterprise teams - SecPilot provides scalable
                    email security solutions with advanced threat detection, comprehensive
                    dashboards, and seamless integrations. Protect against phishing, malware,
                    ransomware, and business email compromise with plans starting at $19/month for
                    small businesses and growing to enterprise-grade protection.
                </Subheading>
            </div>
            <StickyScroll content={content} />
        </div>
    );
};

const PlatformContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='p-4 bg-zinc-900 border border-zinc-800 rounded-lg relative shadow-2xl'>
            {children}
            <div className='absolute bottom-0 w-full h-px inset-x-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent' />
            <div className='absolute bottom-0 w-40 mx-auto h-px inset-x-10 bg-gradient-to-r from-transparent via-emerald-400 to-transparent' />
        </div>
    );
};

const SecurityDashboardMockup = () => {
    return (
        <div className='w-full h-100 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg p-4 relative overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></div>
                    <span className='text-sm text-emerald-400 font-medium'>
                        Security Command Center
                    </span>
                </div>
                <div className='text-xs text-neutral-400'>Last updated: 2 min ago</div>
            </div>

            {/* Main Stats Grid */}
            <div className='grid grid-cols-4 gap-3 mb-4'>
                <div className='bg-zinc-800/50 rounded p-3 border border-emerald-500/20'>
                    <div className='text-xs text-emerald-400 mb-1'>Threats Blocked</div>
                    <div className='text-lg font-bold text-emerald-400'>1,247</div>
                    <div className='text-xs text-neutral-500'>↑ 12% today</div>
                </div>
                <div className='bg-zinc-800/50 rounded p-3 border border-blue-500/20'>
                    <div className='text-xs text-blue-400 mb-1'>Emails Scanned</div>
                    <div className='text-lg font-bold text-blue-400'>15.2K</div>
                    <div className='text-xs text-neutral-500'>↑ 8% today</div>
                </div>
                <div className='bg-zinc-800/50 rounded p-3 border border-amber-500/20'>
                    <div className='text-xs text-amber-400 mb-1'>Quarantined</div>
                    <div className='text-lg font-bold text-amber-400'>89</div>
                    <div className='text-xs text-neutral-500'>↓ 3% today</div>
                </div>
                <div className='bg-zinc-800/50 rounded p-3 border border-purple-500/20'>
                    <div className='text-xs text-purple-400 mb-1'>Risk Score</div>
                    <div className='text-lg font-bold text-purple-400'>Low</div>
                    <div className='text-xs text-neutral-500'>Stable</div>
                </div>
            </div>

            {/* Recent Threats List */}
            <div className='bg-zinc-800/30 rounded p-3 border border-zinc-700'>
                <div className='text-sm text-neutral-300 font-medium mb-2'>
                    Recent Threat Detections
                </div>
                <div className='space-y-2'>
                    {[
                        {
                            type: 'Phishing',
                            sender: 'fake-bank@suspicious.com',
                            time: '2 min ago',
                            severity: 'high',
                        },
                        {
                            type: 'Malware',
                            sender: 'invoice@malicious.net',
                            time: '5 min ago',
                            severity: 'critical',
                        },
                        {
                            type: 'Spam',
                            sender: 'promo@spammer.org',
                            time: '8 min ago',
                            severity: 'low',
                        },
                        {
                            type: 'Scam',
                            sender: 'hacker@scammer.org',
                            time: '12 min ago',
                            severity: 'critical',
                        },
                    ].map((threat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className='flex items-center justify-between text-xs bg-zinc-800/50 rounded p-2'
                        >
                            <div className='flex items-center gap-2'>
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        threat.severity === 'critical'
                                            ? 'bg-red-500'
                                            : threat.severity === 'high'
                                              ? 'bg-amber-500'
                                              : 'bg-yellow-500'
                                    }`}
                                ></div>
                                <span className='text-neutral-300'>{threat.type}</span>
                                <span className='text-neutral-500'>from {threat.sender}</span>
                            </div>
                            <span className='text-neutral-400'>{threat.time}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const APIIntegrationMockup = () => {
    return (
        <div className='w-full h-80 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg p-4 relative overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    <IconTerminal className='w-4 h-4 text-emerald-400' />
                    <span className='text-sm text-emerald-400 font-medium'>API & Integrations</span>
                </div>
                <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
                    <span className='text-xs text-emerald-400'>Live</span>
                </div>
            </div>

            {/* API Endpoints */}
            <div className='space-y-4'>
                <div className='bg-zinc-800/50 rounded p-3 border border-zinc-700'>
                    <div className='text-sm text-neutral-300 font-medium mb-3'>
                        REST API Endpoints
                    </div>
                    <div className='space-y-2'>
                        {[
                            {
                                method: 'GET',
                                endpoint: '/api/v1/threats',
                                desc: 'Fetch threat data',
                                status: 'Active',
                            },
                            {
                                method: 'POST',
                                endpoint: '/api/v1/scan',
                                desc: 'Submit email for scanning',
                                status: 'Active',
                            },
                            {
                                method: 'GET',
                                endpoint: '/api/v1/reports',
                                desc: 'Generate security reports',
                                status: 'Active',
                            },
                        ].map((api, i) => (
                            <div key={i} className='flex items-center justify-between text-xs'>
                                <div className='flex items-center gap-2'>
                                    <span
                                        className={`px-1 py-0.5 rounded text-xs font-mono ${
                                            api.method === 'GET'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-emerald-500/20 text-emerald-400'
                                        }`}
                                    >
                                        {api.method}
                                    </span>
                                    <div>
                                        <div className='text-neutral-300 font-mono'>
                                            {api.endpoint}
                                        </div>
                                        <div className='text-neutral-500'>{api.desc}</div>
                                    </div>
                                </div>
                                <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Webhook Configuration */}
                <div className='bg-zinc-800/50 rounded p-3 border border-zinc-700'>
                    <div className='text-sm text-neutral-300 font-medium mb-3'>
                        Webhook Configuration
                    </div>
                    <div className='space-y-2'>
                        {[
                            {
                                name: 'Slack Alerts',
                                url: 'https://hooks.slack.com/...',
                                events: 'High threats',
                                status: 'Active',
                            },
                            {
                                name: 'SIEM Integration',
                                url: 'https://siem.company.com/...',
                                events: 'All events',
                                status: 'Active',
                            },
                            {
                                name: 'Teams Notifications',
                                url: 'https://outlook.office.com/...',
                                events: 'Critical only',
                                status: 'Pending',
                            },
                        ].map((webhook, i) => (
                            <div key={i} className='flex items-center justify-between text-xs'>
                                <div className='flex items-center gap-2'>
                                    <div className='w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center'>
                                        <span className='text-emerald-400 text-xs'>🔗</span>
                                    </div>
                                    <div>
                                        <div className='text-neutral-300'>{webhook.name}</div>
                                        <div className='text-neutral-500 font-mono text-xs'>
                                            {webhook.url.substring(0, 25)}...
                                        </div>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <div
                                        className={`text-xs ${
                                            webhook.status === 'Active'
                                                ? 'text-emerald-400'
                                                : 'text-amber-400'
                                        }`}
                                    >
                                        {webhook.status}
                                    </div>
                                    <div className='text-xs text-neutral-500'>{webhook.events}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Integration Status */}
                <div className='bg-zinc-800/50 rounded p-3 border border-zinc-700'>
                    <div className='text-sm text-neutral-300 font-medium mb-2'>
                        Integration Status
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                        {[
                            { name: 'Splunk', status: 'Connected', requests: '1.2K/day' },
                            { name: 'Slack', status: 'Connected', requests: '45/day' },
                            { name: 'Teams', status: 'Setup', requests: '0/day' },
                        ].map((integration, i) => (
                            <div key={i} className='bg-zinc-800/30 rounded p-2 text-center'>
                                <div className='text-xs text-neutral-300 font-medium'>
                                    {integration.name}
                                </div>
                                <div
                                    className={`text-xs ${
                                        integration.status === 'Connected'
                                            ? 'text-emerald-400'
                                            : 'text-amber-400'
                                    }`}
                                >
                                    {integration.status}
                                </div>
                                <div className='text-xs text-neutral-500'>
                                    {integration.requests}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportingMockup = () => {
    return (
        <div className='w-full h-80 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg p-4 relative overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    <IconChartBar className='w-4 h-4 text-emerald-400' />
                    <span className='text-sm text-emerald-400 font-medium'>Security Analytics</span>
                </div>
                <div className='flex gap-2'>
                    <button className='text-xs bg-zinc-700 text-neutral-300 px-2 py-1 rounded'>
                        Weekly
                    </button>
                    <button className='text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30'>
                        Monthly
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className='bg-zinc-800/30 rounded p-3 border border-zinc-700 mb-4'>
                <div className='text-xs text-neutral-400 mb-2'>Threat Trends (Last 30 Days)</div>
                <div className='flex items-end justify-between h-20 gap-1'>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.random() * 60 + 20}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className='bg-gradient-to-t from-emerald-500/60 to-emerald-400/80 rounded-sm flex-1'
                        />
                    ))}
                </div>
            </div>

            {/* Report Summary */}
            <div className='grid grid-cols-2 gap-3'>
                <div className='bg-zinc-800/50 rounded p-3 border border-zinc-700'>
                    <div className='text-xs text-neutral-400 mb-1'>Executive Summary</div>
                    <div className='text-sm text-neutral-300'>
                        Security posture improved by 23% this month
                    </div>
                </div>
                <div className='bg-zinc-800/50 rounded p-3 border border-zinc-700'>
                    <div className='text-xs text-neutral-400 mb-1'>Compliance Status</div>
                    <div className='text-sm text-emerald-400'>✓ SOC 2, GDPR, HIPAA</div>
                </div>
            </div>
        </div>
    );
};
