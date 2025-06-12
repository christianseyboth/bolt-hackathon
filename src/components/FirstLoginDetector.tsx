'use client';
import { useEffect } from 'react';

interface FirstLoginDetectorProps {
    isNewAccount: boolean;
}

export const FirstLoginDetector = ({ isNewAccount }: FirstLoginDetectorProps) => {
    useEffect(() => {
        console.log('FirstLoginDetector mounted with isNewAccount:', isNewAccount);

        if (typeof window !== 'undefined') {
            const tourCompleted = localStorage.getItem('tour-completed');
            const firstLoginSet = localStorage.getItem('first-login');

            console.log('FirstLoginDetector - localStorage state:', {
                tourCompleted,
                firstLoginSet,
                isNewAccount
            });

            // If no tour has been completed and first-login hasn't been set
            // This covers both new accounts and existing users who haven't done the tour
            if (!tourCompleted && !firstLoginSet) {
                console.log('✅ Setting first-login flag for user');
                localStorage.setItem('first-login', 'true');

                // Force a small delay to ensure tour can detect the flag
                setTimeout(() => {
                    console.log('✅ Dispatching storage event');
                    window.dispatchEvent(new Event('storage'));
                }, 100);
            } else {
                console.log('❌ Not setting first-login flag because:', {
                    isNewAccount,
                    tourCompleted: !!tourCompleted,
                    firstLoginSet: !!firstLoginSet
                });
            }
        }
    }, [isNewAccount]);

    return null; // This component doesn't render anything
};
