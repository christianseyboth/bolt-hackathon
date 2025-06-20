import { SecurityScore } from './security-score';
import { EmailSetupCard } from './EmailSetupCard';
import { ThreatAlertsCard } from './ThreatAlertsCard';
import { RecentThreatsTable } from './RecentThreatsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconUsers, IconArrowRight, IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';

// Mock data - replace with real API call
const mockScoreData = {
    account_id: 'user-123',
    total_events: 14,
    avg_risk_score: 72.71,
    false_positives: 1,
    criticals: 9,
    highs: 3,
    relevant_threats: 11,
    security_score: 0,
    last_event_at: '2025-06-09T08:52:49.233703+00:00',
};

export const DashboardOverview = () => {
    return (
        <div className='space-y-6'>
            <div data-tour='security-score'>
                <SecurityScore scoreData={mockScoreData} />
            </div>

            <div data-tour='team-setup'>
                <Card className='border border-neutral-800 bg-neutral-900'>
                    <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2'>
                            <IconUsers className='h-5 w-5 text-blue-400' />
                            Team Email Setup
                            <Badge variant='secondary' className='bg-amber-600 text-white'>
                                Setup Required
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div className='p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
                                <div className='flex items-start gap-3'>
                                    <IconInfoCircle className='h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0' />
                                    <div>
                                        <h4 className='font-medium text-blue-400 mb-1'>
                                            Add Team Members
                                        </h4>
                                        <p className='text-sm text-neutral-300'>
                                            Add your team members' email addresses to monitor them
                                            for security threats. Each member's emails will be
                                            analyzed for potential risks.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className='flex gap-2'>
                                <Link href='/dashboard/team' className='flex-1'>
                                    <Button className='w-full'>
                                        <IconArrowRight className='h-4 w-4 mr-2' />
                                        Manage Team
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div data-tour='email-forwarding'>
                <EmailSetupCard />
            </div>

            <div data-tour='recent-threats'>
                <RecentThreatsTable />
            </div>
        </div>
    );
};
