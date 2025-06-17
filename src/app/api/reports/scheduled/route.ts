import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { name, type, format, frequency, recipients, accountId } = body;

        // Validate required fields
        if (!name || !type || !format || !frequency || !recipients || !accountId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate recipients is an array
        if (!Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json(
                { error: 'Recipients must be a non-empty array' },
                { status: 400 }
            );
        }

        // Calculate next run time based on frequency
        const nextRun = calculateNextRun(frequency);

        console.log('Creating scheduled report:', {
            account_id: accountId,
            name,
            type,
            format,
            frequency,
            recipients,
            next_run: nextRun
        });

        // Insert the scheduled report
        const { data, error } = await supabase
            .from('scheduled_reports')
            .insert({
                account_id: accountId,
                name,
                type,
                format,
                frequency,
                recipients,
                next_run: nextRun,
                is_active: true
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating scheduled report:', error);

            // Handle case where table doesn't exist
            if (error.message?.includes('relation "public.scheduled_reports" does not exist')) {
                return NextResponse.json(
                    { error: 'Scheduled reports table not found. Please run database migrations.' },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to create scheduled report', details: error.message },
                { status: 500 }
            );
        }

        console.log('Successfully created scheduled report:', data);
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Create scheduled report error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

function calculateNextRun(frequency: string): string {
    const now = new Date();

    // Set to next hour to avoid immediate execution
    now.setHours(now.getHours() + 1, 0, 0, 0);

    switch (frequency) {
        case 'daily':
            // Run tomorrow at the same hour
            now.setDate(now.getDate() + 1);
            break;
        case 'weekly':
            // Run next week at the same day and hour
            now.setDate(now.getDate() + 7);
            break;
        case 'monthly':
            // Run next month at the same date and hour
            now.setMonth(now.getMonth() + 1);
            break;
        default:
            // Default to weekly
            now.setDate(now.getDate() + 7);
    }

    return now.toISOString();
}
