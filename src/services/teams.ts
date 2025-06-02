import { supabase } from '@/lib/supabase';

export type TeamMember = {
  id: string;
  email: string;
  note?: string;
  addedAt: Date;
  status: 'active' | 'pending' | 'disabled';
};

export async function getTeamMembers(orgId: string): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('orgId', orgId)
      .order('email');
    
    if (error) throw error;
    
    return data.map(member => ({
      ...member,
      addedAt: new Date(member.addedAt)
    }));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export async function addTeamMember(orgId: string, email: string, note?: string): Promise<TeamMember | null> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .insert([
        { 
          orgId,
          email,
          note,
          addedAt: new Date().toISOString(),
          status: 'pending'
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      addedAt: new Date(data.addedAt)
    };
  } catch (error) {
    console.error('Error adding team member:', error);
    return null;
  }
}

export async function removeTeamMember(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing team member:', error);
    return false;
  }
}

export async function updateTeamMemberStatus(id: string, status: 'active' | 'pending' | 'disabled'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_members')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating team member status:', error);
    return false;
  }
}