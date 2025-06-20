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

        const { messageId, host, user, password, port = 110 } = await request.json();

        // Validate required fields
        if (!messageId || !host || !user || !password) {
            console.error('Missing required fields:', { messageId: !!messageId, host: !!host, user: !!user, password: !!password });
            return createApiError('Missing required fields: messageId, host, user, and password are required');
        }

        console.log(`[n8n-pop3] Attempting to delete email with Message-ID: ${messageId} from ${host}:${port}`);

        // Dynamic import of poplib
        let POP3Client: any;
        try {
            const poplibModule = await import('poplib');
            POP3Client = poplibModule.default;
        } catch (importError) {
            console.error('Failed to import poplib:', importError);
            return createApiError('POP3 library not available', 500);
        }

        // Determine if we should use SSL based on port
        const useSSL = port === 995;
        console.log(`[n8n-pop3] Using ${useSSL ? 'SSL' : 'plain'} connection on port ${port}`);

        // Create POP3 connection
        const client = new POP3Client(port, host, {
            tlserr: false,
            enabletls: useSSL,
            debug: false
        });

        let deleted = false;
        let emailsFound = 0;

        try {
            // Connect and authenticate
            await new Promise<void>((resolve, reject) => {
                client.on('connect', () => {
                    console.log(`[n8n-pop3] Connected to ${host}:${port}`);
                    client.login(user, password);
                });

                client.on('login', (status: boolean, data: string) => {
                    if (status) {
                        console.log(`[n8n-pop3] Authentication successful`);
                        resolve();
                    } else {
                        reject(new Error(`Authentication failed: ${data}`));
                    }
                });

                client.on('error', (err: Error) => {
                    reject(err);
                });

                // Set connection timeout
                setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 15000);
            });

            // Get message list
            const messageList = await new Promise<any[]>((resolve, reject) => {
                client.list((status: boolean, msgnum: number, data: any, rawdata: string) => {
                    if (status === false) {
                        resolve([]);
                    } else {
                        const messages = rawdata.split('\r\n')
                            .filter(line => line.match(/^\d+/))
                            .map(line => {
                                const parts = line.trim().split(' ');
                                return {
                                    number: parseInt(parts[0]),
                                    size: parseInt(parts[1])
                                };
                            });
                        resolve(messages);
                    }
                });
            });

            console.log(`[n8n-pop3] Found ${messageList.length} messages in mailbox`);

            // Search through messages for matching Message-ID
            for (const message of messageList) {
                const headers = await new Promise<string>((resolve, reject) => {
                    client.top(message.number, 0, (status: boolean, msgnum: number, data: string) => {
                        if (status) {
                            resolve(data);
                        } else {
                            reject(new Error(`Failed to retrieve headers for message ${message.number}`));
                        }
                    });
                });

                // Check if this message has the matching Message-ID
                const messageIdMatch = headers.match(/^Message-ID:\s*(.+)$/im);
                if (messageIdMatch) {
                    const foundMessageId = messageIdMatch[1].trim();
                    console.log(`[n8n-pop3] Message ${message.number} has Message-ID: ${foundMessageId}`);

                    if (foundMessageId === messageId) {
                        console.log(`[n8n-pop3] Found matching message ${message.number}, deleting...`);

                        // Delete the message
                        await new Promise<void>((resolve, reject) => {
                            client.dele(message.number, (status: boolean, msgnum: number, data: string) => {
                                if (status) {
                                    console.log(`[n8n-pop3] Successfully deleted message ${message.number}`);
                                    deleted = true;
                                    emailsFound++;
                                    resolve();
                                } else {
                                    reject(new Error(`Failed to delete message ${message.number}: ${data}`));
                                }
                            });
                        });
                        break; // Found and deleted, exit loop
                    }
                }
            }

            // Quit connection
            await new Promise<void>((resolve) => {
                client.quit();
                setTimeout(resolve, 1000); // Give time for quit to complete
            });

        } catch (error) {
            // Ensure connection is closed on error
            try {
                client.quit();
            } catch (quitError) {
                console.error('[n8n-pop3] Error during quit:', quitError);
            }
            throw error;
        }

        console.log(`[n8n-pop3] Operation completed. Deleted: ${deleted}, Emails found: ${emailsFound}`);

        return createApiResponse({
            success: true,
            deleted,
            messageId,
            emailsFound,
            protocol: 'POP3',
            ssl: useSSL,
            port,
            timestamp: new Date().toISOString(),
            source: 'n8n'
        });

    } catch (error: any) {
        console.error('[n8n-pop3] Email deletion error:', error);
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
            protocol: 'POP3',
            requiredFields: ['messageId', 'host', 'user', 'password'],
            optionalFields: ['port (default: 110)'],
            authentication: 'Bearer N8N_API_KEY required',
            permissions: 'Dedicated n8n access only',
            ports: {
                110: 'POP3 (plain text)',
                995: 'POP3S (SSL/TLS)'
            },
            example: {
                messageId: '<example@domain.com>',
                host: 'mx2fcf.netcup.net',
                user: 'check@secpilot.io',
                password: 'your-password',
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
