import { NextRequest } from 'next/server';
import { validateApiKey, hasPermission, createApiResponse, createApiError } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

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

        // Get account to check plan
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('id, plan')
            .eq('id', auth.account_id)
            .single();

        if (accountError || !account) {
            return createApiError('Account not found', 404);
        }

        // Check if account has team plan for API access
        const allowedPlans = ['Team'];
        if (!allowedPlans.includes(account.plan)) {
            return createApiError('API access requires Team plan', 403);
        }

        // Parse query parameters
        const url = new URL(request.url);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 1000); // Max 1000
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const threatLevel = url.searchParams.get('threat_level'); // critical, high, medium, low
        const dateFrom = url.searchParams.get('date_from');
        const dateTo = url.searchParams.get('date_to');
        const sortBy = url.searchParams.get('sort') || 'created_at';
        const sortOrder = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

        // Build query - include risk_score and ai_analysis
        let query = supabase
            .from('mail_events')
            .select(`
                id,
                sender_email,
                subject,
                threat_level,
                risk_score,
                ai_analysis,
                created_at
            `)
            .eq('account_id', auth.account_id);

        // Apply filters
        if (threatLevel) {
            query = query.eq('threat_level', threatLevel);
        }
        if (dateFrom) {
            query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
            query = query.lte('created_at', dateTo);
        }

        // Apply sorting and pagination
        query = query
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);

        const { data: analyses, error: analysesError } = await query;

        if (analysesError) {
            console.error('Error fetching analyses:', analysesError);
            // Return more specific error message for debugging
            return createApiError(`Database error: ${analysesError.message}`, 500);
        }

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from('mail_events')
            .select('*', { count: 'exact', head: true })
            .eq('account_id', auth.account_id);

        const response = {
            analyses: analyses || [],
            pagination: {
                total: count || 0,
                limit,
                offset,
                has_more: (count || 0) > offset + limit
            },
            filters: {
                threat_level: threatLevel,
                date_from: dateFrom,
                date_to: dateTo,
                sort_by: sortBy,
                sort_order: sortOrder
            },
            metadata: {
                retrieved_at: new Date().toISOString(),
                api_version: 'v1'
            }
        };

        return createApiResponse(response);

    } catch (error) {
        console.error('Analyses API error:', error);
        return createApiError('Internal server error', 500);
    }
}

export async function OPTIONS(request: NextRequest) {
    return createApiResponse({}, 200);
}

// Documentation endpoint
export async function POST(request: NextRequest) {
    const documentation = {
        endpoint: '/api/v1/analyses',
        method: 'GET',
        description: 'Get email security analyses from mail_events table',
        authentication: 'Bearer API_KEY in Authorization header',
        required_permissions: ['read'],
        required_plan: 'Team',
        parameters: {
            limit: 'number (1-1000, default: 50) - Number of results to return',
            offset: 'number (default: 0) - Number of results to skip',
            threat_level: 'string (optional) - Filter by threat level (critical, high, medium, low)',
            date_from: 'string (optional) - ISO date to filter from',
            date_to: 'string (optional) - ISO date to filter to',
            sort: 'string (default: created_at) - Field to sort by',
            order: 'string (asc/desc, default: desc) - Sort order'
        },
        response: {
            analyses: 'array',
            pagination: 'object',
            filters: 'object',
            metadata: 'object'
        },
        examples: {
            basic: `curl -X GET https://api.secpilot.ai/v1/analyses \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
            filtered: `curl -X GET "https://api.secpilot.ai/v1/analyses?threat_level=critical&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
            paginated: `curl -X GET "https://api.secpilot.ai/v1/analyses?limit=50&offset=100" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
        }
    };

    return createApiResponse(documentation);
}
