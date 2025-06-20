'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const RealtimeTest = () => {
    const [status, setStatus] = useState<string>('disconnected');
    const [messages, setMessages] = useState<string[]>([]);
    const [channel, setChannel] = useState<any>(null);
    const supabase = createClient();

    const addMessage = (message: string) => {
        setMessages((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testBasicConnection = async () => {
        addMessage('Testing basic database connection...');
        try {
            const { data, error } = await supabase.from('mail_events').select('count').limit(1);

            if (error) {
                addMessage(`❌ Database connection failed: ${error.message}`);
            } else {
                addMessage('✅ Database connection successful');
            }
        } catch (error) {
            addMessage(`❌ Database connection error: ${error}`);
        }
    };

    const testRealtimeConnection = () => {
        addMessage('Setting up realtime test subscription...');

        // Clean up existing channel
        if (channel) {
            supabase.removeChannel(channel);
        }

        const testChannel = supabase
            .channel('debug-test-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'mail_events' },
                (payload) => {
                    addMessage(`📨 Change received: ${payload.eventType} on ${payload.table}`);
                    console.log('Full payload:', payload);
                }
            )
            .subscribe((status) => {
                addMessage(`🔄 Subscription status: ${status}`);
                setStatus(status);

                if (status === 'SUBSCRIBED') {
                    addMessage('✅ Realtime subscription successful!');
                } else if (status === 'CHANNEL_ERROR') {
                    addMessage('❌ Realtime subscription failed');
                } else if (status === 'TIMED_OUT') {
                    addMessage('⏰ Realtime subscription timed out');
                }
            });

        setChannel(testChannel);
    };

    const cleanup = () => {
        if (channel) {
            supabase.removeChannel(channel);
            setChannel(null);
            setStatus('disconnected');
            addMessage('🧹 Cleaned up subscription');
        }
    };

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    return (
        <Card className='w-full max-w-2xl'>
            <CardHeader>
                <CardTitle>Realtime Connection Test</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex gap-2'>
                    <Button onClick={testBasicConnection} variant='outline'>
                        Test Database Connection
                    </Button>
                    <Button onClick={testRealtimeConnection} variant='outline'>
                        Test Realtime Connection
                    </Button>
                    <Button onClick={cleanup} variant='outline'>
                        Cleanup
                    </Button>
                </div>

                <div className='text-sm'>
                    <strong>Status:</strong> {status}
                </div>

                <div className='bg-neutral-900 p-3 rounded-md max-h-64 overflow-y-auto'>
                    <div className='text-xs font-mono space-y-1'>
                        {messages.map((message, index) => (
                            <div key={index}>{message}</div>
                        ))}
                    </div>
                </div>

                <div className='text-xs text-neutral-400'>
                    <p>
                        This component tests the same realtime connection as your Supabase dashboard
                        test.
                    </p>
                    <p>Check the browser console for detailed logs.</p>
                </div>
            </CardContent>
        </Card>
    );
};
