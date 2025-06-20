'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Login
export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  // Check if user has MFA enabled
  if (data.user) {
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();

      console.log('MFA Factors Debug:', {
        factors,
        factorsError,
        userId: data.user.id
      });

      if (factorsError) {
        console.error('Error listing MFA factors:', factorsError);
      }

      // Check for TOTP factors (both verified and unverified for debugging)
      const totpFactors = factors?.totp || [];
      const hasVerifiedTotp = totpFactors.some(factor => factor.status === 'verified');
      const hasAnyTotp = totpFactors.length > 0;

      console.log('MFA Check:', {
        hasFactors: !!factors,
        totpFactors: totpFactors,
        hasAnyTotp,
        hasVerifiedTotp,
        factorStatuses: totpFactors.map(f => ({ id: f.id, status: f.status, friendlyName: f.friendly_name }))
      });

      // Only require MFA for verified factors
      if (hasVerifiedTotp) {
        console.log('MFA required - redirecting to challenge');

        // Don't sign out the user - instead mark this as temporary session
        // This prevents race conditions and allows smoother MFA flow

        // Redirect to MFA challenge with credentials
        redirect(`/auth/mfa-challenge?email=${encodeURIComponent(email)}&temp=true`);
      }
    } catch (mfaError) {
      // Check if this is a redirect error (which is expected)
      if (mfaError && typeof mfaError === 'object' && 'digest' in mfaError &&
        typeof mfaError.digest === 'string' && mfaError.digest.includes('NEXT_REDIRECT')) {
        // This is a redirect, re-throw to allow it
        console.log('Redirect detected in MFA check, re-throwing');
        throw mfaError;
      }
      console.error('MFA check error:', mfaError);
      // Continue with normal login if MFA check fails
    }
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

// Signup
export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard`
    }
  });

  if (error) {
    return { error: error.message };
  }

  // Return success instead of redirecting
  return { success: true };
}

// OAuth Sign In (Google, GitHub, etc.)
export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

// Password Reset
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password/update`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// Update Password (after reset)
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

// Signout
export async function signOut() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Sign out from all sessions
    });

    if (error) {
      console.error('Signout error:', error);
      return { error: error.message };
    }

    // Clear cache and revalidate
    revalidatePath('/', 'layout');

    // Return success - client will handle redirect
    return { success: true };
  } catch (error) {
    console.error('Signout exception:', error);
    return { error: 'An error occurred during signout' };
  }
}

// MFA Verification
export async function verifyMFA(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const code = formData.get('code') as string;
  const isTemp = formData.get('temp') === 'true';

  console.log('Email/Password MFA Verification Started:', { email, code: code?.replace(/\s/g, ''), isTemp });

  if (!email || !code) {
    return { error: 'Email and code are required' };
  }

  // For temporary sessions (user already signed in), we don't need password
  // For fresh MFA challenges, we need password
  if (!isTemp && !password) {
    return { error: 'Password is required for fresh MFA verification' };
  }

  let signInData;

  if (isTemp) {
    // User is already signed in from the login flow, just get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !sessionData.user) {
      console.error('Temporary session not found during MFA:', sessionError);
      return {
        error: 'Your session has expired. Please sign in again.',
        shouldRedirectToLogin: true
      };
    }

    // Verify email matches to prevent session hijacking
    if (sessionData.user.email !== email) {
      console.error('Email mismatch in temporary MFA verification');
      return { error: 'Session validation failed. Please sign in again.' };
    }

    signInData = { user: sessionData.user };
  } else {
    // Fresh MFA verification - sign in with email/password first
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Email/Password sign-in failed during MFA:', signInError);

      // Handle specific auth errors
      if (signInError.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or password. Please try again.' };
      } else if (signInError.message.includes('Email not confirmed')) {
        return { error: 'Please confirm your email address before signing in.' };
      }

      return { error: signInError.message };
    }

    signInData = data;
  }

  if (!signInData.user) {
    return { error: 'Authentication failed. Please try again.' };
  }

  // Get the user's MFA factors
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totpFactor = factors?.totp?.find(factor => factor.status === 'verified');

  if (!totpFactor) {
    console.error('No verified MFA factor found for email/password user');
    return { error: 'No verified MFA factor found' };
  }

  // Create MFA challenge
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: totpFactor.id
  });

  if (challengeError) {
    console.error('Email/Password MFA challenge creation failed:', challengeError);
    return { error: 'Failed to create MFA challenge: ' + challengeError.message };
  }

  // Verify the challenge
  const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challengeData.id,
    code: code.replace(/\s/g, '')
  });

  if (verifyError) {
    console.error('Email/Password MFA verification failed:', verifyError);

    // Handle specific MFA errors
    if (verifyError.message.includes('Invalid TOTP code')) {
      return { error: 'Invalid authenticator code. Please try again.' };
    } else if (verifyError.message.includes('Challenge expired')) {
      return { error: 'Challenge expired. Please refresh and try again.' };
    }

    return { error: verifyError.message };
  }

  console.log('Email/Password MFA verification successful');

  // Revalidate and redirect to dashboard
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

// OAuth MFA Verification (for users who signed in via OAuth)
export async function verifyOAuthMFA(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;

  console.log('OAuth MFA Verification Started:', { email, code: code?.replace(/\s/g, '') });

  if (!email || !code) {
    return { error: 'Email and code are required' };
  }

  // For OAuth users, we need to re-authenticate them via OAuth
  // Since we can't do that server-side, we'll use a different approach
  // We'll create a temporary session and verify MFA

  // First, let's try to get the current user (they should still be signed in from OAuth)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  console.log('OAuth user check:', { user: user?.email, userError });

  if (userError || !user) {
    console.error('OAuth user not found during MFA verification:', userError);

    // Clear any stale auth state and redirect to login
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (signOutError) {
      console.error('Error clearing stale auth state:', signOutError);
    }

    // Return a more user-friendly error and clear the MFA challenge
    return {
      error: 'Your session has expired. Please sign in again.',
      shouldRedirectToLogin: true
    };
  }

  // Verify the email matches to prevent session hijacking
  if (user.email !== email) {
    console.error('Email mismatch in OAuth MFA verification');
    return { error: 'Session validation failed. Please sign in again.' };
  }

  // Get the user's MFA factors
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totpFactor = factors?.totp?.find(factor => factor.status === 'verified');

  console.log('OAuth MFA factors:', { factors, totpFactor });

  if (!totpFactor) {
    console.error('No verified MFA factor found for OAuth user');
    return { error: 'No verified MFA factor found' };
  }

  // Create MFA challenge
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: totpFactor.id
  });

  if (challengeError) {
    console.error('OAuth MFA challenge creation failed:', challengeError);
    return { error: 'Failed to create MFA challenge: ' + challengeError.message };
  }

  // Verify the code
  const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challengeData.id,
    code: code.replace(/\s/g, '') // Remove any spaces
  });

  console.log('OAuth MFA Verification Result:', {
    verifyData,
    verifyError,
    code: code.replace(/\s/g, ''),
    factorId: totpFactor.id,
    challengeId: challengeData.id
  });

  if (verifyError) {
    console.error('OAuth MFA verification failed:', verifyError);
    return { error: 'Invalid code. Please try again.' };
  }

  console.log('OAuth MFA verification successful, redirecting to dashboard');
  // Success - redirect to dashboard
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
