'use client';
import React from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { Button } from '@/components/ui/button';
import { useTour as useCustomTour } from '@/hooks/useTour';
import { tourSteps } from '@/config/tourSteps';

const TourContent = () => {
    const { isActive, completeTour, skipTour } = useCustomTour();

    if (!isActive) return null;

    return (
        <TourProvider
            steps={tourSteps}
            onClickMask={({ setCurrentStep, currentStep, steps }) => {
                if (currentStep === steps.length - 1) {
                    completeTour();
                } else {
                    setCurrentStep(currentStep + 1);
                }
            }}
            styles={{
                popover: (base) => ({
                    ...base,
                    '--reactour-accent': '#3b82f6',
                    borderRadius: '12px',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #404040',
                }),
                maskArea: (base) => ({ ...base, rx: 8 }),
                badge: (base) => ({
                    ...base,
                    backgroundColor: '#3b82f6',
                }),
            }}
            beforeClose={completeTour}
        />
    );
};

export const GuidedTour = ({ children }: { children: React.ReactNode }) => {
    return (
        <TourProvider>
            {children}
            <TourContent />
        </TourProvider>
    );
};
