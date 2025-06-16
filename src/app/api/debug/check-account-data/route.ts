import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { accountId } = await request.json();

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
        }

        const supabase = await createClient();

        console.log('🔍 Checking data for account:', accountId);

        // Check account data
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        console.log('📋 Account data:', { account: account?.id, error: accountError });

        // Check subscription data
        const { data: subscriptions, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });

        console.log('📋 Subscription data:', {
            count: subscriptions?.length || 0,
            error: subscriptionError,
            subscriptions: subscriptions?.map(s => ({
                id: s.id,
                plan_name: s.plan_name,
                subscription_status: s.subscription_status,
                stripe_customer_id: s.stripe_customer_id,
                stripe_subscription_id: s.stripe_subscription_id,
                created_at: s.created_at
            }))
        });

        // Check table schema
        const { data: tableInfo, error: schemaError } = await supabase
            .rpc('get_table_columns', { table_name: 'subscriptions' })
            .single();

        console.log('📋 Table schema check:', { tableInfo, error: schemaError });

        return NextResponse.json({
            success: true,
            account: {
                exists: !!account,
                id: account?.id,
                plan: account?.plan,
                stripe_customer_id: account?.stripe_customer_id,
                error: accountError?.message
            },
            subscriptions: {
                count: subscriptions?.length || 0,
                data: subscriptions?.map(s => ({
                    id: s.id,
                    plan_name: s.plan_name,
                    subscription_status: s.subscription_status,
                    stripe_customer_id: s.stripe_customer_id,
                    stripe_subscription_id: s.stripe_subscription_id,
                    created_at: s.created_at
                })) || [],
                error: subscriptionError?.message
            },
            schema: {
                info: tableInfo,
                error: schemaError?.message
            }
        });

    } catch (error) {
        console.error('❌ Debug check error:', error);
        return NextResponse.json({
            error: 'Failed to check account data',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
