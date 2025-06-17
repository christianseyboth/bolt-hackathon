/**
 * Get the correct API base URL based on the environment
 */
export function getApiBaseUrl(): string {
    // For server-side rendering
    if (typeof window === 'undefined') {
        // In production, use the live domain
        if (process.env.NODE_ENV === 'production') {
            return 'https://secpilot.io';
        }
        // In development, use localhost
        return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }

    // For client-side rendering
    // Check if we're on the production domain
    if (window.location.hostname === 'secpilot.io') {
        return 'https://secpilot.io';
    }

    // Otherwise use the current origin (localhost in development)
    return window.location.origin;
}

/**
 * Get the full API endpoint URL
 */
export function getApiEndpointUrl(endpoint: string): string {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/api/v1${endpoint}`;
}

/**
 * Get API documentation examples with the correct domain
 */
export function getApiDocumentationExample(endpoint: string, method: string = 'GET', additionalParams?: string): string {
    const baseUrl = getApiBaseUrl();
    const fullEndpoint = additionalParams ? `${endpoint}${additionalParams}` : endpoint;

    return `curl -X ${method} "${baseUrl}/api/v1${fullEndpoint}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;
}
