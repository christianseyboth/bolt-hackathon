import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        console.log('Delete user API called');
        const { userId } = await request.json();

        if (!userId) {
            console.error('No user ID provided');
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        console.log('Attempting to delete user:', userId);

        // Check if environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            console.error('NEXT_PUBLIC_SUPABASE_URL not found');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY not found');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
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

        console.log('Admin client created, attempting user deletion...');

        // Delete the auth user
        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) {
            console.error('Supabase error deleting user:', error);
            return NextResponse.json({
                error: error.message,
                code: error.status || 'unknown',
                details: error
            }, { status: 500 });
        }

        console.log('User deleted successfully from auth');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
