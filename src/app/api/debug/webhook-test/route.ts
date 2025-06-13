import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Simple webhook test endpoint to check if webhooks are being received
 * This helps debug webhook delivery issues
 */
export async function POST(request: NextRequest) {
    try {
        console.log('🎯 Webhook test endpoint hit!');
        console.log('Headers:', Object.fromEntries(request.headers.entries()));

        const body = await request.text();
        console.log('Raw body length:', body.length);
        console.log('Raw body preview:', body.substring(0, 200));

        const supabase = await createClient();

        // Log to database for debugging
        const { error } = await supabase
            .from('webhook_logs')
            .insert({
                endpoint: 'webhook-test',
                headers: Object.fromEntries(request.headers.entries()),
                body_preview: body.substring(0, 500),
                received_at: new Date().toISOString(),
            })
            .select();

        if (error) {
            console.log('Could not log to database (table might not exist):', error.message);
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook test received successfully',
            timestamp: new Date().toISOString(),
            bodyLength: body.length
        });

    } catch (error) {
        console.error('❌ Webhook test error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

/**
 * GET endpoint to check webhook test status
 */
export async function GET() {
    return NextResponse.json({
        message: 'Webhook test endpoint is running',
        timestamp: new Date().toISOString(),
        info: 'Send POST requests here to test webhook delivery'
    });
}
