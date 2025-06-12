import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        console.log('Getting scheduled report:', id);

        const { data, error } = await supabase
            .from('scheduled_reports')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error getting scheduled report:', error);
            return NextResponse.json(
                { error: 'Failed to get scheduled report', details: error.message },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Scheduled report not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Get scheduled report error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;
        const body = await request.json();

        console.log('Updating scheduled report:', id, body);

        // If updating recipients, ensure it's an array
        if (body.recipients && !Array.isArray(body.recipients)) {
            return NextResponse.json(
                { error: 'Recipients must be an array' },
                { status: 400 }
            );
        }

        // If frequency is being updated, recalculate next_run
        if (body.frequency) {
            body.next_run = calculateNextRun(body.frequency);
        }

        // Always set updated_at to avoid trigger issues
        body.updated_at = new Date().toISOString();

        // Update the scheduled report
        const { data, error } = await supabase
            .from('scheduled_reports')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating scheduled report:', error);

            // Handle case where table doesn't exist
            if (error.message?.includes('relation "public.scheduled_reports" does not exist')) {
                return NextResponse.json(
                    { error: 'Scheduled reports table not found. Please run database migrations.' },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to update scheduled report', details: error.message },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Scheduled report not found' },
                { status: 404 }
            );
        }

        console.log('Successfully updated scheduled report:', data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Update scheduled report error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        console.log('Attempting to delete scheduled report with ID:', id);

        // Verify the report exists first
        const { data: existingReport, error: selectError } = await supabase
            .from('scheduled_reports')
            .select('id, name')
            .eq('id', id)
            .single();

        if (selectError) {
            console.error('Error finding scheduled report:', selectError);
            return NextResponse.json(
                { error: 'Scheduled report not found', details: selectError.message },
                { status: 404 }
            );
        }

        console.log('Found scheduled report to delete:', existingReport);

        // Delete the scheduled report
        const { error } = await supabase
            .from('scheduled_reports')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json(
                { error: 'Failed to delete scheduled report', details: error.message },
                { status: 500 }
            );
        }

        console.log('Successfully deleted scheduled report:', id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete scheduled report error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
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
            now.setDate(now.getDate() + 1);
            break;
        case 'weekly':
            now.setDate(now.getDate() + 7);
            break;
        case 'monthly':
            now.setMonth(now.getMonth() + 1);
            break;
        default:
            now.setDate(now.getDate() + 7);
    }

    return now.toISOString();
}
