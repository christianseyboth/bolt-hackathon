'use client';
import dynamic from 'next/dynamic';

// Lazy load heavy animation components
export const LazySparkles = dynamic(
    () => import('@/components/ui/Sparkles').then((mod) => ({ default: mod.SparklesCore })),
    {
        loading: () => <div className='w-full h-full opacity-20' />,
    }
);

export const LazyVideoModal = dynamic(
    () => import('@/components/VideoModal').then((mod) => ({ default: mod.VideoModal })),
    {
        loading: () => (
            <div className='flex items-center justify-center w-16 h-16 bg-white/10 rounded-full'>
                <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin' />
            </div>
        ),
    }
);

export const LazyBackgroundEffects = dynamic(
    () =>
        import('@/components/BackgroundEffects').then((mod) => ({
            default: mod.BackgroundEffects,
        })),
    {
        loading: () => null,
    }
);

export const LazyTestimonialsSlider = dynamic(
    () =>
        import('@/components/testimonials/Slider').then((mod) => ({
            default: mod.TestimonialsSlider,
        })),
    {
        loading: () => (
            <div className='max-w-4xl mx-auto px-6 py-12'>
                <div className='space-y-6'>
                    <div className='h-20 w-20 bg-neutral-800 rounded-full mx-auto animate-pulse' />
                    <div className='h-6 bg-neutral-800 rounded mx-auto max-w-md animate-pulse' />
                    <div className='flex gap-4 justify-center'>
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className='h-16 w-32 bg-neutral-800 rounded animate-pulse'
                            />
                        ))}
                    </div>
                </div>
            </div>
        ),
    }
);

export const LazyPricingGrid = dynamic(
    () => import('@/components/PricingGrid').then((mod) => ({ default: mod.PricingGrid })),
    {
        ssr: true, // Keep SSR for SEO
        loading: () => (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className='h-96 bg-neutral-900 rounded-xl animate-pulse' />
                ))}
            </div>
        ),
    }
);

// Export lazy icon components with tree shaking
export const LazyIcons = {
    Mail: dynamic(() => import('@tabler/icons-react').then((mod) => ({ default: mod.IconMail }))),
    Shield: dynamic(() =>
        import('@tabler/icons-react').then((mod) => ({ default: mod.IconShield }))
    ),
    ChartBar: dynamic(() =>
        import('@tabler/icons-react').then((mod) => ({ default: mod.IconChartBar }))
    ),
    Terminal: dynamic(() =>
        import('@tabler/icons-react').then((mod) => ({ default: mod.IconTerminal }))
    ),
    Check: dynamic(() => import('@tabler/icons-react').then((mod) => ({ default: mod.IconCheck }))),
    Users: dynamic(() => import('@tabler/icons-react').then((mod) => ({ default: mod.IconUsers }))),
    Help: dynamic(() => import('@tabler/icons-react').then((mod) => ({ default: mod.IconHelp }))),
};

const LazyComponents = {
    LazySparkles,
    LazyVideoModal,
    LazyBackgroundEffects,
    LazyTestimonialsSlider,
    LazyPricingGrid,
    LazyIcons,
};

export default LazyComponents;
