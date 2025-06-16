import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { accountId } = await request.json();

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Step 1: Check what columns exist
        console.log('🔍 Step 1a: Testing column access...');
        const testColumns = ['id', 'account_id', 'subscription_status', 'plan_name', 'current_period_start', 'current_period_end', 'stripe_customer_id', 'stripe_subscription_id'];
        const columnResults: Record<string, boolean> = {};

        for (const column of testColumns) {
            try {
                const { error } = await supabase
                    .from('subscriptions')
                    .select(column)
                    .limit(1);
                columnResults[column] = !error;
                if (error) {
                    console.log(`❌ Column '${column}' error:`, error.message);
                }
            } catch (e) {
                columnResults[column] = false;
            }
        }

        console.log('📊 Column availability:', columnResults);

        // Step 1b: Check if subscription exists
        console.log('🔍 Step 1b: Checking existing subscription...');
        const { data: existingSubscription, error: fetchError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .single();

        if (fetchError) {
            console.error('❌ Error fetching subscription:', fetchError);
            return NextResponse.json({
                error: 'Failed to fetch subscription',
                details: fetchError.message,
                columnResults,
                step: 1
            }, { status: 500 });
        }

        console.log('✅ Existing subscription found:', existingSubscription);

        // Step 2: Try a simple status update first
        console.log('🔍 Step 2: Testing simple status update...');
        const { data: statusUpdateResult, error: statusUpdateError } = await supabase
            .from('subscriptions')
            .update({
                subscription_status: 'active',
                updated_at: new Date().toISOString(),
            })
            .eq('account_id', accountId)
            .select();

        if (statusUpdateError) {
            console.error('❌ Status update failed:', statusUpdateError);
            return NextResponse.json({
                error: 'Failed to update subscription status',
                details: statusUpdateError.message,
                step: 2
            }, { status: 500 });
        }

        console.log('✅ Status update successful:', statusUpdateResult);

        // Step 3: Try updating to Free plan
        console.log('🔍 Step 3: Testing Free plan update...');
        const { data: freePlanResult, error: freePlanError } = await supabase
            .from('subscriptions')
            .update({
                plan_name: 'Free',
                subscription_status: 'active',
                cancel_at_period_end: false,
                seats: 1,
                price_per_seat: 0,
                total_price: 0,
                analysis_amount: 100,
                current_period_start: new Date().toISOString(),
                current_period_end: null,
                stripe_subscription_id: null,
                emails_left: 100,
                updated_at: new Date().toISOString(),
            })
            .eq('account_id', accountId)
            .select();

        if (freePlanError) {
            console.error('❌ Free plan update failed:', freePlanError);
            return NextResponse.json({
                error: 'Failed to update to Free plan',
                details: freePlanError.message,
                originalData: existingSubscription,
                step: 3
            }, { status: 500 });
        }

        console.log('✅ Free plan update successful:', freePlanResult);

        // Step 4: Check what the subscription looks like now
        const { data: finalSubscription, error: finalError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .single();

        return NextResponse.json({
            success: true,
            message: 'All subscription updates successful',
            originalSubscription: existingSubscription,
            statusUpdateResult,
            freePlanResult,
            finalSubscription,
        });

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return NextResponse.json({
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
