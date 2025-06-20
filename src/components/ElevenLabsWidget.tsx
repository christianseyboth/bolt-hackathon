'use client';

import { useEffect, useRef } from 'react';

interface ElevenLabsWidgetProps {
    agentId: string;
}

export const ElevenLabsWidget = ({ agentId }: ElevenLabsWidgetProps) => {
    const loadedRef = useRef(false);

    useEffect(() => {
        // Prevent multiple loads
        if (loadedRef.current) return;
        loadedRef.current = true;

        // Check if script already exists
        if (document.querySelector('script[src*="convai-widget-embed"]')) {
            console.log('ElevenLabs script already loaded');
            return;
        }

        // Load the script (same approach as working test)
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
        script.async = true;

        script.onload = () => {
            console.log('✅ ElevenLabs script loaded');

            // Add widget after short delay (same as test)
            setTimeout(() => {
                if (!document.querySelector('elevenlabs-convai')) {
                    const widget = document.createElement('elevenlabs-convai');
                    widget.setAttribute('agent-id', agentId);
                    document.body.appendChild(widget);
                    console.log('✅ ElevenLabs widget added');
                }
            }, 1000);
        };

        script.onerror = () => {
            console.error('❌ Failed to load ElevenLabs script');
        };

        document.head.appendChild(script);
    }, [agentId]);

    return null;
};
