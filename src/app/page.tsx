import { CTA } from '@/components/marketing/cta';
import { FAQs } from '@/components/marketing/faqs';
import { Features } from '@/components/features';
import { Hero } from '@/components/marketing/hero';
import { Testimonials } from '@/components/testimonials';
import { Tools } from '@/components/marketing/tools';
import { NavBar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
    return (
        <>
            <NavBar />
            <main className='relative min-h-screen bg-neutral-950' style={{ position: 'relative' }}>
                {/* Enhanced unified background with subtle animations */}
                <div className='fixed inset-0 pointer-events-none'>
                    {/* Main background gradient */}
                    <div className='absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900' />

                    {/* Subtle radial gradients for depth */}
                    <div className='absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl' />
                    <div className='absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl' />
                    <div className='absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/4 rounded-full blur-3xl' />

                    {/* Animated floating orbs */}
                    <div className='absolute top-20 right-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl animate-pulse' />
                    <div
                        className='absolute bottom-32 left-20 w-24 h-24 bg-blue-500/8 rounded-full blur-2xl animate-pulse'
                        style={{ animationDelay: '2s' }}
                    />

                    {/* Floating particles */}
                    <div className='absolute inset-0'>
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className='absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse'
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 4}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Animated grid pattern - more visible */}
                    <div className='absolute inset-0 opacity-[0.08] animate-grid-flow bg-grid-pattern' />

                    {/* Flowing diagonal lines */}
                    <div className='absolute inset-0 opacity-[0.04] animate-diagonal-flow bg-diagonal-pattern' />

                    {/* Subtle moving glow */}
                    <div className='absolute w-96 h-96 rounded-full opacity-30 animate-floating-glow bg-glow-pattern' />

                    {/* Noise texture for premium feel */}
                    <div
                        className='absolute inset-0 opacity-[0.015]'
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                {/* Page content with proper z-index and semantic structure */}
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
