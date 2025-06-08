'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export function ClientToastHandler() {
    const params = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        if (params.get('login') === 'success') {
            toast({
                title: 'Login Successful',
                description: 'Welcome back!',
            });
            // Optional: Den Param aus der URL entfernen (wenn gewünscht, für UX)
            // (Geht z.B. mit router.replace, wenn du willst)
        }
    }, [params, toast]);

    return null;
}
