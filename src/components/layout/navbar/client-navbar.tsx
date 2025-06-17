'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export function ClientNavBar() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const supabase = createClient();
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
    }, []);

    return (
        <nav
            style={{
                position: 'fixed',
                top: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                width: '95%',
                maxWidth: '1200px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '15px',
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <Link
                href='/'
                style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                }}
            >
                SecPilot
            </Link>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link
                    href='/pricing'
                    style={{
                        color: 'white',
                        textDecoration: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                    }}
                >
                    Pricing
                </Link>
                <Link
                    href='/contact'
                    style={{
                        color: 'white',
                        textDecoration: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                    }}
                >
                    Contact
                </Link>

                {loading ? (
                    <div style={{ width: '80px', height: '36px' }} /> // Placeholder while loading
                ) : user ? (
                    <Link
                        href='/dashboard'
                        style={{
                            backgroundColor: '#22c55e',
                            color: 'white',
                            padding: '8px 16px',
                            textDecoration: 'none',
                            borderRadius: '6px',
                        }}
                    >
                        Dashboard
                    </Link>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                            href='/register'
                            style={{
                                color: 'white',
                                padding: '8px 16px',
                                textDecoration: 'none',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '6px',
                            }}
                        >
                            Register
                        </Link>
                        <Link
                            href='/login'
                            style={{
                                backgroundColor: '#22c55e',
                                color: 'white',
                                padding: '8px 16px',
                                textDecoration: 'none',
                                borderRadius: '6px',
                            }}
                        >
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
