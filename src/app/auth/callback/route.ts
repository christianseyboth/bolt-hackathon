import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    // Redirect all authenticated users to dashboard
    let next = '/dashboard'

    // Allow override with next parameter if it's a valid relative URL
    const nextParam = searchParams.get('next')
    if (nextParam && nextParam.startsWith('/') && nextParam !== '/') {
        next = nextParam
    }

    // Handle OAuth errors from the provider
    if (error) {
        console.error('OAuth error from provider:', { error, error_description });
        const errorParams = new URLSearchParams({
            error: error,
            error_description: error_description || 'OAuth authentication failed'
        });
        return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`);
    }

    if (code) {
        const supabase = await createClient()

        try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

            if (exchangeError) {
                console.error('Code exchange error:', exchangeError);
                const errorParams = new URLSearchParams({
                    error: exchangeError.name || 'SessionExchangeError',
                    error_description: exchangeError.message || 'Failed to exchange code for session'
                });
                return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`);
            }

            if (!data.user) {
                console.error('No user data after successful code exchange');
                const errorParams = new URLSearchParams({
                    error: 'NoUserData',
                    error_description: 'Authentication succeeded but no user data was returned'
                });
                return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`);
            }

            // Check if user has MFA enabled
            try {
                const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();

                console.log('OAuth MFA Factors Debug:', {
                    factors,
                    factorsError,
                    userId: data.user.id,
                    userEmail: data.user.email
                });

                if (factorsError) {
                    console.error('Error listing MFA factors in OAuth callback:', factorsError);
                    // Don't fail the auth flow for MFA check errors, just log and continue
                }

                // Check for verified TOTP factors
                const totpFactors = factors?.totp || [];
                const hasVerifiedTotp = totpFactors.some(factor => factor.status === 'verified');

                console.log('OAuth MFA Check:', {
                    hasFactors: !!factors,
                    totpFactors: totpFactors,
                    hasVerifiedTotp,
                    factorStatuses: totpFactors.map(f => ({ id: f.id, status: f.status, friendlyName: f.friendly_name }))
                });

                if (hasVerifiedTotp) {
                    console.log('OAuth MFA required - redirecting to challenge');
                    // Don't sign out - redirect to MFA challenge with OAuth flag
                    const email = data.user.email;
                    if (email) {
                        return NextResponse.redirect(`${origin}/auth/mfa-challenge?email=${encodeURIComponent(email)}&oauth=true`);
                    }
                }
            } catch (mfaError) {
                console.error('OAuth MFA check error:', mfaError);
                // Continue with normal login if MFA check fails - don't break the auth flow
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } catch (callbackError) {
            console.error('Unexpected error in auth callback:', callbackError);
            const errorParams = new URLSearchParams({
                error: 'CallbackError',
                error_description: 'An unexpected error occurred during authentication callback'
            });
            return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`);
        }
    }

    // No code parameter - this shouldn't happen in normal OAuth flow
    console.error('Auth callback called without code parameter');
    const errorParams = new URLSearchParams({
        error: 'MissingCode',
        error_description: 'No authorization code was provided'
    });
    return NextResponse.redirect(`${origin}/auth/auth-code-error?${errorParams}`);
}
