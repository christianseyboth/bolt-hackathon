'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface TourStep {
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    action?: () => void;
}

export const useTour = (isNewAccount: boolean = false) => {
    const [isTourActive, setIsTourActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const searchParams = useSearchParams();

    // Check if we should start the tour
    const checkTourStatus = () => {
        if (typeof window === 'undefined') return;

        // Check if tour was already completed
        const tourCompleted = localStorage.getItem('proactiv-tour-completed');
        const isFirstLogin = localStorage.getItem('proactiv-first-login');

        // URL parameter takes precedence (for debugging)
        const forceStart = searchParams.get('tour') === 'start';
        const forceComplete = searchParams.get('tour') === 'complete';

        if (forceComplete) {
            localStorage.setItem('proactiv-tour-completed', 'true');
            localStorage.removeItem('proactiv-first-login');
            setIsTourActive(false);
            return;
        }

        if (forceStart) {
            // Force start tour, clear completion flag
            localStorage.removeItem('proactiv-tour-completed');
            setIsTourActive(true);
            return;
        }

        // Look for saved step from navigation
        const savedStep = localStorage.getItem('proactiv-tour-step');
        if (savedStep && !tourCompleted) {
            setCurrentStep(parseInt(savedStep));
            setIsTourActive(true);
            return;
        }

        // Start tour for first-time users
        if ((isNewAccount || isFirstLogin) && !tourCompleted) {
            setIsTourActive(true);
            return;
        }

        // Don't start if already completed
        if (tourCompleted) {
            return;
        }
    };

    // Listen for storage events (first login detection)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'proactiv-first-login' && e.newValue) {
                checkTourStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Initial check on mount
    useEffect(() => {
        checkTourStatus();
    }, [isNewAccount, searchParams]);

    const startTour = () => {
        setIsTourActive(true);
        setCurrentStep(0);
        localStorage.removeItem('proactiv-tour-completed');
    };

    const endTour = () => {
        setIsTourActive(false);
        localStorage.setItem('proactiv-tour-completed', 'true');
        localStorage.removeItem('proactiv-first-login');
        localStorage.removeItem('proactiv-tour-step');
    };

    const nextStep = () => {
        setCurrentStep(prev => {
            const next = prev + 1;
            localStorage.setItem('proactiv-tour-step', next.toString());
            return next;
        });
    };

    const prevStep = () => {
        setCurrentStep(prev => {
            const prev_step = Math.max(0, prev - 1);
            localStorage.setItem('proactiv-tour-step', prev_step.toString());
            return prev_step;
        });
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
        localStorage.setItem('proactiv-tour-step', step.toString());
    };

    return {
        isTourActive,
        currentStep,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
    };
};
