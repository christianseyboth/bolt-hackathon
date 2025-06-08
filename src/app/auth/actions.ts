'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';


// Login
export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

 // Signup
 export async function signUp(formData: FormData) {
   const supabase = await createClient();
   const email = formData.get('email') as string;
   const password = formData.get('password') as string;

   const { error } = await supabase.auth.signUp({ email, password });
   if (error) {
     return { error: error.message };
   }
   redirect('/dashboard');
 }

 // Signout
 export async function signOut() {

   const supabase = await createClient();
   const { error } = await supabase.auth.signOut()


   if (error) {
     return { error: error.message };
   }
   redirect('/');
 }
