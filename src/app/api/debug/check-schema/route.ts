import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        console.log('🔍 Testing subscriptions table access...');

        // Try to select all columns to see what exists
        const { data: allData, error: allError } = await supabase
            .from('subscriptions')
            .select('*')
            .limit(1);

        console.log('All columns select result:', { data: allData, error: allError });

        // Try specific columns that might exist
        const testColumns = [
            'id',
            'account_id',
            'stripe_subscription_id',
            'subscription_id',
            'stripe_id',
            'status',
            'plan_name',
            'plan',
            'current_period_start',
            'current_period_end',
            'created_at',
            'updated_at'
        ];

        const columnResults: Record<string, boolean> = {};

        for (const column of testColumns) {
            try {
                const { error } = await supabase
                    .from('subscriptions')
                    .select(column)
                    .limit(1);

                columnResults[column] = !error;
                if (error) {
                    console.log(`Column '${column}' test error:`, error.message);
                }
            } catch (e) {
                columnResults[column] = false;
            }
        }

        console.log('Column test results:', columnResults);

        // Try to get existing subscriptions with basic columns
        const { data: existingData, error: existingError } = await supabase
            .from('subscriptions')
            .select('id, account_id, status')
            .limit(5);

        return NextResponse.json({
            success: true,
            all_columns_test: {
                data: allData,
                error: allError
            },
            column_tests: columnResults,
            existing_subscriptions: {
                data: existingData,
                error: existingError
            }
        });

    } catch (error) {
        console.error('❌ Schema check error:', error);
        return NextResponse.json({
            error: 'Schema check failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
