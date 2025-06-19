'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const supabase = createClient();

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize auth state
    useEffect(() => {
        if (!mounted) return;

        const getUser = async () => {
            try {
                const {
                    data: { user },
                    error,
                } = await supabase.auth.getUser();
                if (!error) {
                    setUser(user);
                }
            } catch (error) {
                console.error('Error getting user:', error);
            } finally {
                setLoading(false);
            }
        };

        getUser();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
            } else if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [mounted, supabase.auth]);

    const signOut = async () => {
        try {
            await supabase.auth.signOut({ scope: 'global' });
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Don't render children until mounted to prevent hydration issues
    if (!mounted) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
