"use server"
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from "next/cache";



export async function addTeamMember(formData: FormData) {
const supabase = await createClient();


  const email = String(formData.get("email") || "");
  const label = String(formData.get("note") || "");
  const subscription_id = String(formData.get("subscriptionId") || "");
  const created_by = String(formData.get("createdBy") || "");

  const { data, error } = await supabase
    .from('authorized_addresses')
    .insert([{ email, label, subscription_id, created_by }])
    .select();

  if (error) {

    throw new Error(`Error adding team member: ${error.message}`);
  }
  revalidatePath("/dashboard/team")
  return data;
}

export async function removeTeamMember(formData: FormData) {
  const memberId = String(formData.get("id") || "");
  if (!memberId) throw new Error("No member ID");

const supabase = await createClient();


  const { data, error } = await supabase
    .from('authorized_addresses')
    .delete()
    .eq('id', memberId)
    .select();

  if (error) {
    throw new Error(`Error removing team member: ${error.message}`);
  }

  revalidatePath("/dashboard/team");
}
