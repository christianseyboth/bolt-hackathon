import '../globals.css';
import { NavBar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { createClient } from '@/utils/supabase/server';

export default async function MarketingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    return (
        <>
            <NavBar user={user} />
            <main>{children}</main>
            <Footer />
            <Toaster />
        </>
    );
}
