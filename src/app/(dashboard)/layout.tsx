'use server';

import { createClient } from '@/utils/supabase/server';
import '../globals.css';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Toaster } from '@/components/ui/Toaster';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { redirect } from 'next/navigation';
import { AccountProvider } from '@/context/account-context';
import { CustomTour } from '@/components/tour/CustomTour';
import { FirstLoginDetector } from '@/components/FirstLoginDetector';

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

    if (subscription_error || !account_data) {
        console.error('Failed to load account data:', subscription_error);
        redirect('/login');
    }

    // Check if this is a new account (created within the last 24 hours)
    const accountCreatedAt = new Date(account_data.created_at);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const isNewAccount = accountCreatedAt > twentyFourHoursAgo;

    return (
        <AccountProvider accountId={account_data.id}>
            <div className='h-screen flex dark:bg-neutral-950'>
                {/* Sidebar - Only visible above 1024px */}
                <div className='hidden [@media(min-width:1025px)]:block flex-shrink-0'>
                    <Sidebar />
                </div>

                <div className='flex-1 flex flex-col h-screen min-w-0'>
                    {/* Mobile Header - Visible at 1024px and below */}
                    <div className='[@media(min-width:1025px)]:hidden'>
                        <MobileHeader />
                    </div>

                    <main
                        className='flex-1 flex flex-col space-y-4 pt-4 pb-12 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'
                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#525252 #262626' }}
                    >
                        <div className='px-4 [@media(min-width:1025px)]:px-8 min-w-0'>
                            {children}
                        </div>
                    </main>
                    <Toaster />
                    <CustomTour />
                    <FirstLoginDetector isNewAccount={isNewAccount} />
                </div>
            </div>
        </AccountProvider>
    );
}
