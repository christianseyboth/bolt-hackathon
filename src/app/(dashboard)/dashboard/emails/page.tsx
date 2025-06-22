import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmailList } from '@/components/dashboard/email/EmailList';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmailsPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }
    let { data: account_data } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    const accountId = account_data.id;

    let { data: emails } = await supabase
        .from('mail_events')
        .select('*')
        .eq('account_id', accountId);

    return (
        <div className='min-w-0 w-full'>
            <DashboardHeader
                heading='Email Analysis'
                subheading='View and manage all analyzed emails'
            />
            <div className='mt-8 min-w-0' data-tour="email-list">
                <EmailList emails={emails} />
            </div>
        </div>
    );
}
