'use server';

import { createClient } from '@/utils/supabase/server';
import '../globals.css';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { MobileHeader } from '@/components/dashboard/mobile-header';
import { redirect } from 'next/navigation';
import { AccountProvider } from '@/context/account-context';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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


    return (
        <AccountProvider accountId={account_data.owner_id}>
            <div className='h-screen flex dark:bg-neutral-950'>
                <Sidebar />
                <div className='flex-1 flex flex-col h-screen'>
                    <MobileHeader />
                    <main className='flex-1 flex flex-col space-y-4 px-4 md:px-8 pt-4 pb-12 overflow-y-auto'>
                        {children}
                    </main>
                    <Toaster />
                </div>
            </div>
        </AccountProvider>
    );
}
