import React from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EmailDetail, EmailAnalysisData } from '@/components/dashboard/email-detail';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

type EmailDetailPageProps = {
    params: Promise<{
        emailId: string;
    }>;
};

export default async function EmailDetailPage({ params }: EmailDetailPageProps) {
    const { emailId } = await params;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }

    const { data: aiAnalysis } = await supabase
        .from('mail_events')
        .select('ai_analysis')
        .eq('id', emailId)
        .single();

    console.log(aiAnalysis);

    return (
        <>
            <Button variant='outline' size='sm' asChild className='mb-4 w-fit'>
                <Link href='/emails'>
                    <IconArrowLeft className='mr-2 h-4 w-4' />
                    Back to Email List
                </Link>
            </Button>

            <DashboardHeader
                heading='Email Analysis'
                subheading='Detailed security analysis of the selected email'
            />

            <div className='mt-8'>
                <EmailDetail data={aiAnalysis} />
            </div>
        </>
    );
}
