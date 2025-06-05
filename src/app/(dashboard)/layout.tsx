'use server';

import { createClient } from '@/utils/supabase/server';
import '../globals.css';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { MobileHeader } from '@/components/dashboard/mobile-header';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }


    return (
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
    );
}
