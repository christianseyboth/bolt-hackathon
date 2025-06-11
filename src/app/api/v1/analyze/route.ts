import { NextRequest } from 'next/server';
import { validateApiKey, hasPermission, createApiResponse, createApiError } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
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

        // Parse request body
        const body = await request.json();
        const { email_content, email_headers, analysis_type = 'full' } = body;

        if (!email_content) {
            return createApiError('email_content is required');
        }

        // TODO: Implement actual email analysis logic here
        // This is a placeholder response
        const analysisResult = {
            id: `analysis_${Date.now()}`,
            account_id: auth.account_id,
            analysis_type,
            results: {
                threat_level: 'low',
                confidence: 0.95,
                categories: ['phishing', 'spam'],
                details: {
                    sender_reputation: 'good',
                    content_analysis: 'clean',
                    link_analysis: 'safe',
                    attachment_analysis: 'none'
                },
                recommendations: [
                    'Email appears safe to process',
                    'No malicious content detected'
                ]
            },
            metadata: {
                analyzed_at: new Date().toISOString(),
                processing_time_ms: 150,
                model_version: 'v1.2.0'
            }
        };

        return createApiResponse(analysisResult);

    } catch (error) {
        console.error('Email analysis error:', error);
        return createApiError('Internal server error', 500);
    }
}

export async function OPTIONS(request: NextRequest) {
    return createApiResponse({}, 200);
}

// Example usage documentation
export async function GET(request: NextRequest) {
    const documentation = {
        endpoint: '/api/v1/analyze',
        method: 'POST',
        description: 'Analyze email content for security threats',
        authentication: 'Bearer API_KEY in Authorization header',
        required_permissions: ['read'],
        parameters: {
            email_content: {
                type: 'string',
                required: true,
                description: 'The email content to analyze'
            },
            email_headers: {
                type: 'object',
                required: false,
                description: 'Email headers for additional context'
            },
            analysis_type: {
                type: 'string',
                required: false,
                default: 'full',
                options: ['quick', 'full', 'deep'],
                description: 'Type of analysis to perform'
            }
        },
        response: {
            id: 'string',
            account_id: 'string',
            analysis_type: 'string',
            results: {
                threat_level: 'low | medium | high | critical',
                confidence: 'number',
                categories: 'array of strings',
                details: 'object',
                recommendations: 'array of strings'
            },
            metadata: 'object'
        },
        example: {
            curl: `curl -X POST https://api.proactiv.ai/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email_content": "Subject: Urgent: Verify your account...",
    "analysis_type": "full"
  }'`
        }
    };

    return createApiResponse(documentation);
}
