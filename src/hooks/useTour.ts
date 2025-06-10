'use client';
import { useState, useEffect } from 'react';

interface TourStep {
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    action?: () => void;
}

export const useTour = () => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasCompletedTour, setHasCompletedTour] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Delay mounting to ensure hydration is complete
        const timer = setTimeout(() => {
            setIsMounted(true);

            // Only check localStorage after mounting (client-side)
            if (typeof window !== 'undefined') {
                const completed = localStorage.getItem('tour-completed');
                const isFirstLogin = localStorage.getItem('first-login');
                const isNavigating = localStorage.getItem('tour-navigating');
                const savedStep = localStorage.getItem('tour-current-step');

                if (!completed) {
                    if (isNavigating === 'true' && savedStep) {
                        setIsActive(true);
                        setCurrentStep(parseInt(savedStep));
                        localStorage.removeItem('tour-navigating');
                    } else if (isFirstLogin === 'true') {
                        setIsActive(true);
                        setCurrentStep(0);
                    }
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const startTour = () => {
        if (!isMounted) return;
        setIsActive(true);
        setCurrentStep(0);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('tour-current-step');
            localStorage.removeItem('tour-navigating');
        }
    };

    const completeTour = () => {
        setIsActive(false);
        setHasCompletedTour(true);
        if (typeof window !== 'undefined') {
            localStorage.setItem('tour-completed', 'true');
            localStorage.removeItem('first-login');
            localStorage.removeItem('tour-current-step');
            localStorage.removeItem('tour-navigating');
        }
    };

    const skipTour = () => {
        setIsActive(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem('tour-completed', 'true');
            localStorage.removeItem('first-login');
            localStorage.removeItem('tour-current-step');
            localStorage.removeItem('tour-navigating');
        }
    };

    return {
        isActive: isMounted ? isActive : false,
        currentStep,
        setCurrentStep,
        startTour,
        completeTour,
        skipTour,
        hasCompletedTour
    };
};
