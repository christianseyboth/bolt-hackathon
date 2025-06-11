import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        console.log('Testing admin auth...');

        // Check if environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL not found' }, { status: 500 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not found' }, { status: 500 });
        }

        // Create admin client with service role key
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Test admin functionality by listing users
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('Admin auth test failed:', error);
            return NextResponse.json({
                error: 'Admin auth failed',
                details: error
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Admin auth working',
            userCount: data?.users?.length || 0
        });

    } catch (error) {
        console.error('Test error:', error);
        return NextResponse.json(
            { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
