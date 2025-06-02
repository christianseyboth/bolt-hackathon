// app/auth/actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type AuthError = { message: string };

export async function signIn(
  email: string,
  password: string
): Promise<{ user: any | null; error: AuthError | null }> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies,
    }
  );
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { user: null, error: { message: error.message } };
  }
  return { user: data.user, error: null };
}

export async function signUp(
  email: string,
  password: string
): Promise<{ user: any | null; error: AuthError | null }> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies,
    }
  );
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/auth/callback`,
    },
  });
  if (error) {
    return { user: null, error: { message: error.message } };
  }
  return { user: data.user, error: null };
}

export async function signOutUser(): Promise<{ error: AuthError | null }> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies,
    }
  );
  
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: { message: error.message } };
  }
  return { error: null };
}

export async function getServerSession() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies,
    }
  );
  
  return await supabase.auth.getSession();
}