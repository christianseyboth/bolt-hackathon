'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    IconX,
    IconArrowLeft,
    IconArrowRight,
    IconPlayerSkipForward,
    IconCheck
} from '@tabler/icons-react';
import { useTour } from '@/hooks/useTour';
import { tourSteps } from '@/config/tourSteps';

export const CustomTour = () => {
    const { isActive, currentStep, setCurrentStep, completeTour, skipTour } = useTour();
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Ensure component only runs on client
    useEffect(() => {
        setIsMounted(true);
        // Add extra delay to ensure hydration is complete
        const hydrationTimer = setTimeout(() => {
            setIsHydrated(true);
        }, 500);

        return () => clearTimeout(hydrationTimer);
    }, []);

    useEffect(() => {
        // Only run after component is mounted, hydrated, AND tour is active
        if (!isMounted || !isHydrated || !isActive || !tourSteps[currentStep]) return;

        // Additional safety check
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        // Dynamic delay based on step type - longer for navigation steps
        const isNavigationStep = tourSteps[currentStep].action !== undefined;
        const isEmailForwardingStep = tourSteps[currentStep].target === '[data-tour="email-forwarding"]';
        const delay = isEmailForwardingStep ? 1500 : (isNavigationStep ? 1000 : 300); // Extra long for email forwarding

                const findAndHighlightElement = (retryCount = 0) => {
            const element = document.querySelector(tourSteps[currentStep].target) as HTMLElement;

            console.log(`Tour step ${currentStep}: Looking for ${tourSteps[currentStep].target}, found:`, !!element, `(retry ${retryCount})`);

            // Only proceed if element exists and we're still mounted
            if (element && isMounted && isHydrated) {
                setTargetElement(element);

                // Apply highlight styles only on client after hydration
                requestAnimationFrame(() => {
                    if (element && isHydrated) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // Use a more specific class-based approach instead of inline styles
                        element.classList.add('tour-highlight');

                        // Fallback to inline styles if needed
                        if (!element.classList.contains('tour-highlight')) {
                            element.style.position = 'relative';
                            element.style.zIndex = '1001';
                            element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
                            element.style.borderRadius = '8px';
                            element.style.transition = 'all 0.3s ease';
                        }
                    }
                });
            } else if (retryCount < (isEmailForwardingStep ? 5 : 3) && isMounted && isHydrated) {
                // Retry more times for email forwarding step, regular retry for others
                setTimeout(() => findAndHighlightElement(retryCount + 1), 500 * (retryCount + 1));
            }
        };

        const timer = setTimeout(() => {
            findAndHighlightElement();
        }, delay); // Dynamic delay based on step type

        return () => {
            clearTimeout(timer);
            // Clean up styles only if element exists and we're hydrated
            if (targetElement && isHydrated && typeof window !== 'undefined') {
                requestAnimationFrame(() => {
                    targetElement.classList.remove('tour-highlight');
                    targetElement.style.position = '';
                    targetElement.style.zIndex = '';
                    targetElement.style.boxShadow = '';
                    targetElement.style.borderRadius = '';
                    targetElement.style.transition = '';
                });
            }
        };
    }, [isMounted, isHydrated, isActive, currentStep]);

    const nextStep = () => {
        const currentStepData = tourSteps[currentStep];

        // Clean up current element before moving to next
        if (targetElement && isHydrated) {
            targetElement.classList.remove('tour-highlight');
            targetElement.style.position = '';
            targetElement.style.zIndex = '';
            targetElement.style.boxShadow = '';
            targetElement.style.borderRadius = '';
            targetElement.style.transition = '';
            setTargetElement(null);
        }

                // Execute action if it exists
        if (currentStepData.action) {
            currentStepData.action();
            return;
        }

        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const prevStep = () => {
        // Clean up current element before moving to previous
        if (targetElement && isHydrated) {
            targetElement.classList.remove('tour-highlight');
            targetElement.style.position = '';
            targetElement.style.zIndex = '';
            targetElement.style.boxShadow = '';
            targetElement.style.borderRadius = '';
            targetElement.style.transition = '';
            setTargetElement(null);
        }

        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Don't render anything during SSR, before mounting, or before hydration
    if (!isMounted || !isHydrated || typeof window === 'undefined' || !isActive || !tourSteps[currentStep]) {
        return null;
    }

    const step = tourSteps[currentStep];
    const progress = ((currentStep + 1) / tourSteps.length) * 100;

    const getModalPosition = () => {
        const currentTarget = tourSteps[currentStep]?.target;

        if (currentTarget === '[data-tour="threat-alerts"]') {
            return "fixed bottom-4 right-4 z-[1002] w-80";
        }

        return "fixed top-4 right-4 z-[1002] w-80";
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-[1000]" />

            {/* Tour Card */}
            <div className={getModalPosition()}>
                <Card className="border border-blue-500 bg-neutral-900 shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary" className="bg-blue-500 text-white">
                                Step {currentStep + 1} of {tourSteps.length}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={skipTour}>
                                <IconX className="h-4 w-4" />
                            </Button>
                        </div>

                        <Progress value={progress} className="mb-4" />

                        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                        <p className="text-sm text-neutral-400 mb-6">{step.content}</p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                >
                                    <IconArrowLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Button>
                                <Button variant="ghost" size="sm" onClick={skipTour}>
                                    Skip Tour
                                </Button>
                            </div>

                            <Button onClick={nextStep} size="sm">
                                {currentStep === tourSteps.length - 1 ? (
                                    <>
                                        <IconCheck className="h-4 w-4 mr-1" />
                                        Complete
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <IconArrowRight className="h-4 w-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};
