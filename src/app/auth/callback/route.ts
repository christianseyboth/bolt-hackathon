import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Redirect all authenticated users to dashboard
    let next = '/dashboard'

    // Allow override with next parameter if it's a valid relative URL
    const nextParam = searchParams.get('next')
    if (nextParam && nextParam.startsWith('/') && nextParam !== '/') {
        next = nextParam
    }

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.user) {
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
                    // Don't sign out - instead redirect to MFA challenge
                    const email = data.user.email;
                    if (email) {
                        return NextResponse.redirect(`${origin}/auth/mfa-challenge?email=${encodeURIComponent(email)}&oauth=true`);
                    }
                }
            } catch (mfaError) {
                console.error('OAuth MFA check error:', mfaError);
                // Continue with normal login if MFA check fails
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
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
