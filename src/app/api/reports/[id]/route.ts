import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        console.log('Attempting to delete report with ID:', id);

        // Verify the report exists first
        const { data: existingReport, error: selectError } = await supabase
            .from('report_history')
            .select('id, name')
            .eq('id', id)
            .single();

        if (selectError) {
            console.error('Error finding report:', selectError);
            return NextResponse.json(
                { error: 'Report not found', details: selectError.message },
                { status: 404 }
            );
        }

        console.log('Found report to delete:', existingReport);

        // Delete the report from the database
        const { error } = await supabase
            .from('report_history')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json(
                { error: 'Failed to delete report', details: error.message },
                { status: 500 }
            );
        }

        console.log('Successfully deleted report:', id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete report error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: (error as Error).message },
            { status: 500 }
        );
    }
}
