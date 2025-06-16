import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export interface ApiAuthResult {
    success: boolean;
    account_id?: string;
    permissions?: string[];
    rate_limit?: number;
    error?: string;
}

export async function validateApiKey(request: NextRequest): Promise<ApiAuthResult> {
    try {
        // Get API key from Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { success: false, error: 'Missing or invalid Authorization header' };
        }

        const apiKey = authHeader.replace('Bearer ', '');
        if (!apiKey) {
            return { success: false, error: 'API key is required' };
        }

        // Validate the API key using Supabase function with service role
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const { data, error } = await supabase
            .rpc('validate_api_key', { api_key_param: apiKey });

        if (error) {
            console.error('API key validation error:', error);
            return { success: false, error: 'Invalid API key' };
        }

        if (!data || data.length === 0 || !data[0].is_valid) {
            return { success: false, error: 'API key is invalid or expired' };
        }

        const keyData = data[0];
        return {
            success: true,
            account_id: keyData.account_id,
            permissions: keyData.permissions,
            rate_limit: keyData.rate_limit
        };

    } catch (error) {
        console.error('Error validating API key:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Admin permission grants all access
    if (userPermissions.includes('admin')) {
        return true;
    }

    // Check for specific permission
    if (userPermissions.includes(requiredPermission)) {
        return true;
    }

    // Write permission includes read
    if (requiredPermission === 'read' && userPermissions.includes('write')) {
        return true;
    }

    return false;
}

export function createApiResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export function createApiError(message: string, status = 400) {
    return createApiResponse({
        error: message,
        status
    }, status);
}
