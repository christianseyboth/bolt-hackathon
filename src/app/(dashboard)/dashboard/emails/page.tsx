import React from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { EmailList } from '@/components/dashboard/email-list';
import { createClient } from '@/utils/supabase/server';
import { log } from 'console';
import { redirect } from 'next/navigation';

export default async function EmailsPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }

    let { data: emails, error: fetchError } = await supabase
        .from('mail_events')
        .select('*')
        .eq('user_id', user.id);
    log(emails);
    return (
        <>
            <DashboardHeader
                heading='Email Analysis'
                subheading='View and manage all analyzed emails'
            />
            <div className='mt-8'>
                <EmailList emails={emails} />
            </div>
        </>
    );
}
