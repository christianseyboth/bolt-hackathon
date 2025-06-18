'use i18n';
import { CTA } from '@/components/marketing/cta';
import { FAQs } from '@/components/marketing/faqs';
import { Features } from '@/components/features';
import { Hero } from '@/components/marketing/hero';
import { Testimonials } from '@/components/testimonials';
import { Tools } from '@/components/marketing/tools';
import { NavBar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { BackgroundEffects } from '@/components/background-effects';

type Props = {
    params: Promise<{ lang: string }>;
};

export default async function Home({ params }: Props) {
    const { lang } = await params;

    return (
        <>
            <NavBar />
            <main className='relative min-h-screen bg-neutral-950' style={{ position: 'relative' }}>
                <BackgroundEffects />

                <div className='relative z-10'>
                    <header>
                        <Hero />
                    </header>
                    <section aria-label='Email security features'>
                        <Features />
                    </section>
                    <section aria-label='SecPilot platform overview'>
                        <Tools />
                    </section>
                    <section aria-label='Customer testimonials'>
                        <Testimonials />
                    </section>
                    <section aria-label='Frequently asked questions'>
                        <FAQs />
                    </section>
                    <section aria-label='Get started with SecPilot'>
                        <CTA />
                    </section>
                </div>
            </main>
            <Footer />
            <Toaster />
        </>
    );
}
