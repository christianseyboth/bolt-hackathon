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
        // Sign out the user since they need to complete MFA
        await supabase.auth.signOut();
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

  revalidatePath('/', 'layout');
  redirect('/dashboard');
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
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

// MFA Verification
export async function verifyMFA(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const code = formData.get('code') as string;

  console.log('Email/Password MFA Verification Started:', { email, code: code?.replace(/\s/g, '') });

  // First, sign in with email/password
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error('Email/Password sign-in failed during MFA:', signInError);
    return { error: signInError.message };
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

  // Verify the code
  const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challengeData.id,
    code: code.replace(/\s/g, '') // Remove any spaces
  });

  console.log('Email/Password MFA Verification Result:', {
    verifyData,
    verifyError,
    code: code.replace(/\s/g, ''),
    factorId: totpFactor.id,
    challengeId: challengeData.id
  });

  if (verifyError) {
    console.error('Email/Password MFA verification failed:', verifyError);
    return { error: 'Invalid code. Please try again.' };
  }

  console.log('Email/Password MFA verification successful, redirecting to dashboard');
  // Success - redirect to dashboard
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
    return { error: 'Please sign in again to complete MFA verification' };
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
