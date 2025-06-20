'use client';
import { useEffect } from 'react';

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

// Core Web Vitals reporting
export function reportWebVitals(metric: any) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', metric);
    }

    // Send to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
            custom_map: { metric_id: 'custom.performance' },
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
        });
    }
}

export const WebVitalsTracker = () => {
    useEffect(() => {
        // Only track in production
        if (process.env.NODE_ENV !== 'production') return;

        // Note: web-vitals v4+ uses onINP instead of onFID
        import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
            onCLS(reportWebVitals);
            onINP(reportWebVitals); // INP (Interaction to Next Paint) replaced FID
            onFCP(reportWebVitals);
            onLCP(reportWebVitals);
            onTTFB(reportWebVitals);
        });
    }, []);

    return null;
};

export default WebVitalsTracker;
