import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({
                error: 'Not authenticated',
                user: null,
                account: null,
                subscription: null
            }, { status: 401 });
        }

        console.log('🔍 Checking account status for user:', user.id);

        // Check for account by owner_id
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('owner_id', user.id)
            .single();

        // Check for account by email if not found by owner_id
        let accountByEmail = null;
        if (accountError) {
            const { data: emailAccount, error: emailError } = await supabase
                .from('accounts')
                .select('*')
                .eq('billing_email', user.email)
                .single();

            if (!emailError) {
                accountByEmail = emailAccount;
            }
        }

        // Check for subscription
        const accountId = account?.id || accountByEmail?.id;
        let subscription = null;
        let subscriptionError = null;

        if (accountId) {
            const { data: sub, error: subError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            subscription = sub;
            subscriptionError = subError;
        }

        const result = {
            user: {
                id: user.id,
                email: user.email,
                provider: user.app_metadata?.provider,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name,
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                created_at: user.created_at
            },
            account: {
                found_by_owner_id: !!account,
                found_by_email: !!accountByEmail,
                data: account || accountByEmail,
                error: accountError?.message
            },
            subscription: {
                found: !!subscription,
                data: subscription,
                error: subscriptionError?.message
            },
            diagnosis: {
                has_account: !!(account || accountByEmail),
                has_subscription: !!subscription,
                account_subscription_match: accountId && subscription?.account_id === accountId,
                needs_setup: !(account || accountByEmail) || !subscription,
                recommended_action: !(account || accountByEmail)
                    ? 'Create account and subscription'
                    : !subscription
                    ? 'Create subscription'
                    : 'Account setup complete'
            }
        };

        console.log('📋 User account diagnosis:', result.diagnosis);

        return NextResponse.json(result);

    } catch (error) {
        console.error('❌ Error checking user account:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
