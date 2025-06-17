'use client';
import { useEffect } from 'react';

interface FirstLoginDetectorProps {
    isNewAccount: boolean;
}

export function FirstLoginDetector({ isNewAccount }: FirstLoginDetectorProps) {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const hasExistingFlag = localStorage.getItem('proactiv-first-login');
        const tourCompleted = localStorage.getItem('proactiv-tour-completed');

        // Only set the flag if this is a new account and we haven't set it before and tour isn't completed
        if (isNewAccount && !hasExistingFlag && !tourCompleted) {
            localStorage.setItem('proactiv-first-login', 'true');

            // Dispatch a storage event to notify other components
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'proactiv-first-login',
                    newValue: 'true',
                    oldValue: null,
                    storageArea: localStorage,
                })
            );
        }
    }, [isNewAccount]);

    return null;
}
