import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconLock, IconCrown, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';

interface SubscriptionAccessGateProps {
    feature: 'reports' | 'security-analytics' | 'api';
    currentPlan: string;
    requiredPlan: string;
    children?: React.ReactNode;
}

const featureDetails = {
    reports: {
        title: 'Advanced Reports',
        description: 'Generate comprehensive security reports and analytics',
        icon: <IconLock className='h-8 w-8 text-amber-400' />,
        benefits: [
            'Comprehensive security reports',
            'Scheduled report delivery',
            'Custom report templates',
            'Historical data analysis',
            'Export to PDF/CSV formats',
        ],
    },
    'security-analytics': {
        title: 'Security Analytics',
        description: 'Advanced threat analysis and security insights',
        icon: <IconLock className='h-8 w-8 text-blue-400' />,
        benefits: [
            'Advanced threat detection',
            'Risk assessment analytics',
            'Security score tracking',
            'Attack pattern analysis',
            'Real-time threat monitoring',
        ],
    },
    api: {
        title: 'API Access',
        description: 'Programmatic access to SecPilot features',
        icon: <IconLock className='h-8 w-8 text-emerald-400' />,
        benefits: [
            'RESTful API endpoints',
            'Real-time data access',
            'Custom integrations',
            'Automated workflows',
            'Developer documentation',
        ],
    },
};

export function SubscriptionAccessGate({
    feature,
    currentPlan,
    requiredPlan,
    children,
}: SubscriptionAccessGateProps) {
    const details = featureDetails[feature];

    return (
        <div className='flex items-center justify-center min-h-[400px] p-4'>
            <Card className='max-w-2xl w-full border-neutral-800 bg-neutral-900/50 backdrop-blur-sm'>
                <CardHeader className='text-center pb-6'>
                    <div className='flex justify-center mb-4'>
                        <div className='p-4 rounded-full bg-neutral-800/50'>{details.icon}</div>
                    </div>

                    <CardTitle className='text-2xl font-bold mb-2'>{details.title}</CardTitle>

                    <p className='text-neutral-400 text-lg'>{details.description}</p>
                </CardHeader>

                <CardContent className='space-y-6'>
                    {/* Current vs Required Plan */}
                    <div className='flex items-center justify-center gap-4 p-4 bg-neutral-800/30 rounded-lg'>
                        <div className='text-center'>
                            <div className='text-sm text-neutral-400 mb-1'>Current Plan</div>
                            <Badge variant='outline' className='text-neutral-300'>
                                {currentPlan}
                            </Badge>
                        </div>

                        <IconArrowRight className='h-5 w-5 text-neutral-500' />

                        <div className='text-center'>
                            <div className='text-sm text-neutral-400 mb-1'>Required Plan</div>
                            <Badge className='bg-emerald-600 text-white'>
                                <IconCrown className='h-3 w-3 mr-1' />
                                {requiredPlan}
                            </Badge>
                        </div>
                    </div>

                    {/* Feature Benefits */}
                    <div>
                        <h4 className='font-semibold text-neutral-200 mb-3'>
                            What you'll get with {requiredPlan}:
                        </h4>
                        <ul className='space-y-2'>
                            {details.benefits.map((benefit, index) => (
                                <li
                                    key={index}
                                    className='flex items-center text-sm text-neutral-300'
                                >
                                    <div className='w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3 flex-shrink-0' />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Upgrade CTA */}
                    <div className='pt-4'>
                        <Link href='/dashboard/subscription' className='block'>
                            <Button className='w-full bg-emerald-600 hover:bg-emerald-700 text-white'>
                                <IconCrown className='h-4 w-4 mr-2' />
                                Upgrade to {requiredPlan}
                            </Button>
                        </Link>

                        <p className='text-xs text-neutral-500 text-center mt-3'>
                            Upgrade anytime • Cancel anytime • 30-day money-back guarantee
                        </p>
                    </div>

                    {children && <div className='pt-4 border-t border-neutral-800'>{children}</div>}
                </CardContent>
            </Card>
        </div>
    );
}
