import { NextRequest } from 'next/server';
import { createApiResponse, createApiError } from '@/lib/api-auth';

// Type declaration for dynamic import
declare const require: any;

export async function POST(request: NextRequest) {
    try {
        // Check for dedicated n8n API key from environment variable
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return createApiError('Missing or invalid Authorization header', 401);
        }

        const apiKey = authHeader.replace('Bearer ', '');
        const n8nApiKey = process.env.N8N_API_KEY;

        if (!n8nApiKey) {
            console.error('N8N_API_KEY environment variable not configured');
            return createApiError('API not configured', 500);
        }

        // Validate against environment variable
        if (apiKey !== n8nApiKey) {
            console.error('Invalid API key provided');
            return createApiError('Invalid API key', 401);
        }

        const { messageId, host, user, password, port = 993 } = await request.json();

        // Validate required fields
        if (!messageId || !host || !user || !password) {
            console.error('Missing required fields:', { messageId: !!messageId, host: !!host, user: !!user, password: !!password });
            return createApiError('Missing required fields: messageId, host, user, and password are required');
        }

        console.log(`[n8n] Attempting to delete email with Message-ID: ${messageId} from ${host}`);

        // Dynamic import with error handling
        let imaps: any;
        try {
            const imapModule = await import('imap-simple');
            imaps = imapModule.default;
        } catch (importError) {
            console.error('Failed to import imap-simple:', importError);
            return createApiError('IMAP library not available', 500);
        }

        const connection = await imaps.connect({
            imap: {
                user,
                password,
                host,
                port,
                tls: true,
                authTimeout: 10000,
                connTimeout: 10000
            }
        });

        console.log(`[n8n] IMAP connection established successfully`);

        await connection.openBox('INBOX');
        console.log(`[n8n] INBOX opened successfully`);

        // Search for email by Message-ID
        const results = await connection.search([['HEADER', 'MESSAGE-ID', messageId]]);
        console.log(`[n8n] Found ${results.length} emails matching Message-ID: ${messageId}`);

        let deleted = false;
        if (results.length > 0) {
            const uids = results.map((res: any) => res.attributes.uid);
            console.log(`[n8n] Marking emails with UIDs ${uids.join(', ')} for deletion`);

            await connection.addFlags(uids, ['\\Deleted']);
            await connection.imap.expunge();
            deleted = true;

            console.log(`[n8n] Successfully deleted ${results.length} email(s)`);
        } else {
            console.log(`[n8n] No emails found with the specified Message-ID`);
        }

        await connection.end();
        console.log(`[n8n] IMAP connection closed`);

        return createApiResponse({
            success: true,
            deleted,
            messageId,
            emailsFound: results.length,
            timestamp: new Date().toISOString(),
            source: 'n8n'
        });

    } catch (error: any) {
        console.error('Email deletion error:', error);
        return createApiError(error.message || 'Unknown error occurred', 500);
    }
}

// Test endpoint - also requires the same API key
export async function GET(request: NextRequest) {
    try {
        // Check for dedicated n8n API key from environment variable
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return createApiError('Missing or invalid Authorization header', 401);
        }

        const apiKey = authHeader.replace('Bearer ', '');
        const n8nApiKey = process.env.N8N_API_KEY;

        if (!n8nApiKey) {
            return createApiError('API not configured', 500);
        }

        if (apiKey !== n8nApiKey) {
            return createApiError('Invalid API key', 401);
        }

        return createApiResponse({
            message: 'n8n Email Deletion API is running',
            endpoint: '/api/delete-email',
            method: 'POST',
            requiredFields: ['messageId', 'host', 'user', 'password'],
            optionalFields: ['port'],
            authentication: 'Bearer N8N_API_KEY required',
            permissions: 'Dedicated n8n access only',
            example: {
                messageId: '<example@domain.com>',
                host: 'mx2fcf.netcup.net',
                user: 'check@secpilot.io',
                password: '#I4cjp719',
                port: 110
            }
        });
    } catch (error: any) {
        return createApiError('Internal server error', 500);
    }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
    return createApiResponse({}, 200);
}
