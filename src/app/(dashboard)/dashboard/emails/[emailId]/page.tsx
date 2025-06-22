import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmailDetail, EmailAnalysisData } from '@/components/dashboard/email/EmailDetail';
import { Button } from '@/components/ui/Button';
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

    const { data: mail } = await supabase
        .from('mail_events')
        .select('*')
        .eq('id', emailId)
        .single();

    console.log(mail);

    return (
        <>
            <Button variant='outline' size='sm' asChild className='mb-4 w-fit'>
                <Link href='/dashboard/emails'>
                    <IconArrowLeft className='mr-2 h-4 w-4' />
                    Back to Email List
                </Link>
            </Button>

            <DashboardHeader
                heading='Email Analysis'
                subheading='Detailed security analysis of the selected email'
            />

            <div className='mt-8'>
                <EmailDetail mail={mail} />
            </div>
        </>
    );
}
