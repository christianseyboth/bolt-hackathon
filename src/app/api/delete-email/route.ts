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
            console.error('[n8n-imap] N8N_API_KEY environment variable not configured');
            return createApiError('N8N_API_KEY environment variable not configured', 500);
        }

        // Validate against environment variable
        if (apiKey !== n8nApiKey) {
            console.error('[n8n-imap] Invalid API key provided. Expected length:', n8nApiKey.length, 'Received length:', apiKey.length);
            return createApiError('Invalid API key provided', 401);
        }

        const { messageId, host, user, password, port = 993 } = await request.json();

        // Validate required fields
        if (!messageId || !host || !user || !password) {
            console.error('Missing required fields:', { messageId: !!messageId, host: !!host, user: !!user, password: !!password });
            return createApiError('Missing required fields: messageId, host, user, and password are required');
        }

        console.log(`[n8n-imap] Attempting to delete email with Message-ID: ${messageId} from ${host}:${port}`);

        // Dynamic import with error handling
        let imaps: any;
        try {
            const imapModule = await import('imap-simple');
            imaps = imapModule.default;
        } catch (importError: any) {
            console.error('[n8n-imap] Failed to import imap-simple:', importError);
            return createApiError(`IMAP library import failed: ${importError?.message || 'Unknown import error'}`, 500);
        }

        // Determine SSL settings based on port
        const useSSL = port === 993 || port === 995;
        console.log(`[n8n-imap] Using ${useSSL ? 'SSL' : 'plain'} connection on port ${port}`);

        const connection = await imaps.connect({
            imap: {
                user,
                password,
                host,
                port,
                tls: useSSL,
                authTimeout: 10000,
                connTimeout: 10000
            }
        });

        console.log(`[n8n-imap] IMAP connection established successfully`);

        await connection.openBox('INBOX');
        console.log(`[n8n-imap] INBOX opened successfully`);

        // Search for email by Message-ID
        const results = await connection.search([['HEADER', 'MESSAGE-ID', messageId]]);
        console.log(`[n8n-imap] Found ${results.length} emails matching Message-ID: ${messageId}`);

        let deleted = false;
        if (results.length > 0) {
            const uids = results.map((res: any) => res.attributes.uid);
            console.log(`[n8n-imap] Marking emails with UIDs ${uids.join(', ')} for deletion`);

            await connection.addFlags(uids, ['\\Deleted']);
            await connection.imap.expunge();
            deleted = true;

            console.log(`[n8n-imap] Successfully deleted ${results.length} email(s)`);
        } else {
            console.log(`[n8n-imap] No emails found with the specified Message-ID`);
        }

        await connection.end();
        console.log(`[n8n-imap] IMAP connection closed`);

        return createApiResponse({
            success: true,
            deleted,
            messageId,
            emailsFound: results.length,
            protocol: 'IMAP',
            ssl: useSSL,
            port,
            timestamp: new Date().toISOString(),
            source: 'n8n'
        });

    } catch (error: any) {
        console.error('[n8n-imap] Email deletion error:', error);

        // Provide more detailed error information
        const errorMessage = error?.message || 'Unknown error occurred';
        const errorDetails = {
            message: errorMessage,
            name: error?.name || 'Error',
            code: error?.code || 'UNKNOWN',
            stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        };

        console.error('[n8n-imap] Detailed error:', errorDetails);

        return createApiError(`IMAP Error: ${errorMessage}`, 500);
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
            protocol: 'IMAP',
            requiredFields: ['messageId', 'host', 'user', 'password'],
            optionalFields: ['port (default: 993)'],
            authentication: 'Bearer N8N_API_KEY required',
            permissions: 'Dedicated n8n access only',
            ports: {
                143: 'IMAP (plain text)',
                993: 'IMAPS (SSL/TLS)'
            },
            example: {
                messageId: '<example@domain.com>',
                host: 'mx2fcf.netcup.net',
                user: 'check@secpilot.io',
                password: 'your-password',
                port: 993
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
