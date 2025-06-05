import React from 'react';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className='min-h-screen bg-neutral-950'>
            <main className='min-h-screen flex flex-col'>{children}</main>
            <Toaster />
        </div>
    );
}
