import React from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TeamManagement } from '@/components/dashboard/team-management';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function TeamPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }
    let { data: account_data, error: subscription_error } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    let { data: subscription_plans, error: subscription_plans_error } = await supabase
        .from('subscription_plans')
        .select('*');

    let { data: current_subscription, error: current_subscription_error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('account_id', account_data.id)
        .single();

    const { data: members } = await supabase
        .from('authorized_addresses')
        .select('id, email, label, created_at, status')
        .eq('subscription_id', current_subscription.id);

    console.log(members);

    return (
        <>
            <DashboardHeader
                heading='Team Management'
                subheading='Manage who can send emails for analysis'
            />
            <div className='mt-8'>
                <TeamManagement
                    initialMembers={members || []}
                    maxTeamMembers={current_subscription.seats}
                    account={account_data}
                    subscription={current_subscription}
                />
            </div>
        </>
    );
}
