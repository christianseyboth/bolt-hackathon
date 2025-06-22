import { NavBar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/Toaster';

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
