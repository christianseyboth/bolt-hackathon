import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        console.log('🔍 Checking account/subscription for user:', user.id, user.email);

        // Check accounts by owner_id
        const { data: accountsByOwner, error: ownerError } = await supabase
            .from('accounts')
            .select('*')
            .eq('owner_id', user.id);

        // Check accounts by email
        const { data: accountsByEmail, error: emailError } = await supabase
            .from('accounts')
            .select('*')
            .eq('billing_email', user.email);

        console.log('📊 Accounts by owner_id:', accountsByOwner?.length || 0);
        console.log('📊 Accounts by email:', accountsByEmail?.length || 0);

        // Get all subscriptions for any accounts found
        const allAccountIds = [
            ...(accountsByOwner || []).map(a => a.id),
            ...(accountsByEmail || []).map(a => a.id)
        ];

        const uniqueAccountIds = [...new Set(allAccountIds)];

        let subscriptions = [];
        if (uniqueAccountIds.length > 0) {
            const { data: subs, error: subError } = await supabase
                .from('subscriptions')
                .select('*')
                .in('account_id', uniqueAccountIds);

            subscriptions = subs || [];
            console.log('📊 Subscriptions found:', subscriptions.length);
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at
            },
            accounts: {
                byOwnerId: accountsByOwner || [],
                byEmail: accountsByEmail || []
            },
            subscriptions,
            debug: {
                uniqueAccountIds,
                ownerError,
                emailError
            }
        });

    } catch (error) {
        console.error('Debug check error:', error);
        return NextResponse.json({
            error: 'Failed to check account/subscription',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
