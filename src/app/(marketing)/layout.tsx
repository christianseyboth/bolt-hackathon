import { NavBar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
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
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <NavBar user={user} />
            <main style={{ position: 'relative' }}>{children}</main>
            <Footer />
            <Toaster />
        </div>
    );
}
