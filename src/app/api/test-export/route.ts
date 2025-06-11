import { NextRequest, NextResponse } from 'next/server';
import { exportAccountData } from '@/app/account/actions';

export async function GET(request: NextRequest) {
    try {
        console.log('Testing export account data...');

        const result = await exportAccountData();

        console.log('Export test result:', result);

        return NextResponse.json({
            test: 'export-account-data',
            timestamp: new Date().toISOString(),
            result
        });

    } catch (error) {
        console.error('Test export error:', error);

        return NextResponse.json({
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
