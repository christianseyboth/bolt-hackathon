import { NavBar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

export default async function MarketingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <NavBar />
            <main style={{ position: 'relative' }}>{children}</main>
            <Footer />
            <Toaster />
        </div>
    );
}
