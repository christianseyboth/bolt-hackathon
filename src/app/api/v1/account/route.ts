import { NextRequest } from 'next/server';
import { validateApiKey, hasPermission, createApiResponse, createApiError } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';
import { getApiBaseUrl } from '@/lib/api-config';

export async function GET(request: NextRequest) {
    try {
        // Validate API key
        const auth = await validateApiKey(request);
        if (!auth.success) {
            return createApiError(auth.error || 'Authentication failed', 401);
        }

        // Check permissions
        if (!hasPermission(auth.permissions || [], 'read')) {
            return createApiError('Insufficient permissions', 403);
        }

                // Use service role client to bypass RLS for API access
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

        // Get account information using service role to bypass RLS
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select(`
                id,
                full_name,
                plan,
                billing_email,
                created_at,
                subscriptions (
                    id,
                    plan_name,
                    status,
                    current_period_end
                )
            `)
            .eq('id', auth.account_id)
            .single();

        // If account not found, let's see what accounts exist
        if (accountError || !account) {
            return createApiError('Account not found', 404);
        }

        // Check if account has team plan for API access
        const allowedPlans = ['Team']; // Only Team plan has API access
        if (!allowedPlans.includes(account.plan)) {
            return createApiError('API access requires Team plan', 403);
        }

        // Get API key usage stats
        const { data: apiKeys, error: keysError } = await supabase
            .from('api_keys')
            .select('id, name, last_used_at, rate_limit, is_active')
            .eq('account_id', auth.account_id)
            .eq('is_active', true);

        const response = {
            account: {
                id: account.id,
                name: account.full_name,
                tier: account.plan,
                email: account.billing_email,
                created_at: account.created_at,
                subscription: account.subscriptions?.[0] || null
            },
            api_usage: {
                active_keys: apiKeys?.length || 0,
                total_rate_limit: apiKeys?.reduce((sum, key) => sum + key.rate_limit, 0) || 0
            },
            metadata: {
                retrieved_at: new Date().toISOString(),
                api_version: 'v1'
            }
        };

        return createApiResponse(response);

    } catch (error) {
        console.error('Account API error:', error);
        return createApiError('Internal server error', 500);
    }
}

export async function OPTIONS(request: NextRequest) {
    return createApiResponse({}, 200);
}

// Documentation endpoint
export async function POST(request: NextRequest) {
    const documentation = {
        endpoint: '/api/v1/account',
        method: 'GET',
        description: 'Get account information and usage statistics',
        authentication: 'Bearer API_KEY in Authorization header',
        required_permissions: ['read'],
        parameters: 'None',
        response: {
            account: {
                id: 'string',
                name: 'string',
                tier: 'string',
                email: 'string',
                created_at: 'string (ISO 8601)',
                subscription: 'object | null'
            },
            api_usage: {
                active_keys: 'number',
                total_rate_limit: 'number'
            },
            metadata: 'object'
        },
        example: {
            curl: `curl -X GET ${getApiBaseUrl()}/api/v1/account \\
  -H "Authorization: Bearer YOUR_API_KEY"`
        }
    };

    return createApiResponse(documentation);
}
