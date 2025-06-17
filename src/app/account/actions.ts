'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface DeleteAccountResult {
    success: boolean;
    error?: string;
}

export async function deleteAccount(confirmationText: string): Promise<DeleteAccountResult> {
    try {
        // Validate confirmation text
        if (confirmationText !== 'DELETE') {
            return {
                success: false,
                error: 'Please type "DELETE" to confirm account deletion'
            };
        }

        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Get user's account
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (accountError || !account) {
            return { success: false, error: 'Account not found' };
        }

        // Delete in order (most dependent first)
        console.log('Starting database cleanup for account:', account.id);

        // 1. Delete API keys (no CASCADE - must delete manually)
        const { error: apiKeysError } = await supabase
            .from('api_keys')
            .delete()
            .eq('account_id', account.id);

        if (apiKeysError) {
            console.error('Error deleting API keys:', apiKeysError);
            // Continue with deletion even if API keys fail
        } else {
            console.log('API keys deleted successfully');
        }

        // 2. Delete mail_events (has CASCADE but delete manually to be safe)
        const { error: mailEventsError } = await supabase
            .from('mail_events')
            .delete()
            .eq('account_id', account.id);

        if (mailEventsError) {
            console.error('Error deleting mail events:', mailEventsError);
            // Continue with deletion
        } else {
            console.log('Mail events deleted successfully');
        }

        // 3. Delete authorized_addresses (both via subscriptions AND created_by user)
        // First delete by subscription_id
        const { data: subscriptionIds } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('account_id', account.id);

        if (subscriptionIds && subscriptionIds.length > 0) {
            for (const sub of subscriptionIds) {
                const { error: authAddressError } = await supabase
                    .from('authorized_addresses')
                    .delete()
                    .eq('subscription_id', sub.id);

                if (authAddressError) {
                    console.error('Error deleting authorized addresses by subscription:', authAddressError);
                }
            }
        }

        // CRITICAL: Also delete authorized_addresses created_by this user
        const { error: authAddressByUserError } = await supabase
            .from('authorized_addresses')
            .delete()
            .eq('created_by', user.id);

        if (authAddressByUserError) {
            console.error('Error deleting authorized addresses by user:', authAddressByUserError);
        } else {
            console.log('Authorized addresses deleted successfully');
        }

        // 4. Delete subscriptions (has CASCADE to accounts)
        const { error: subscriptionsError } = await supabase
            .from('subscriptions')
            .delete()
            .eq('account_id', account.id);

        if (subscriptionsError) {
            console.error('Error deleting subscriptions:', subscriptionsError);
            // Continue with deletion
        } else {
            console.log('Subscriptions deleted successfully');
        }

        // 3. Delete account record first (database constraints require this)
        const { error: deleteAccountError } = await supabase
            .from('accounts')
            .delete()
            .eq('id', account.id);

        if (deleteAccountError) {
            console.error('Error deleting account:', deleteAccountError);
            return { success: false, error: 'Failed to delete account data' };
        }

        console.log('Account data deleted successfully');

        // 4. Delete the auth user after database cleanup
        try {
            console.log('Attempting to delete auth user:', user.id);

            // Check if environment variables are available
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                console.error('NEXT_PUBLIC_SUPABASE_URL not found');
                return { success: false, error: 'Server configuration error' };
            }

            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                console.error('SUPABASE_SERVICE_ROLE_KEY not found');
                return { success: false, error: 'Server configuration error - missing service role key' };
            }

            // Import createClient from supabase-js directly
            const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');

            // Create admin client with service role key
            const adminSupabase = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            console.log('Admin client created, attempting user deletion...');

            // Try to delete the auth user
            const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(user.id);

            if (deleteUserError) {
                console.error('Supabase error deleting user:', deleteUserError);
                // Try using the database function as fallback
                try {
                    const { error: functionError } = await adminSupabase
                        .rpc('delete_user_completely', { user_id: user.id });

                    if (functionError) {
                        console.error('Database function also failed:', functionError);
                        console.log('Auth user deletion failed, but account data was cleaned up');
                    } else {
                        console.log('Auth user deleted successfully via database function');
                    }
                } catch (functionErr) {
                    console.error('Could not call database function:', functionErr);
                    console.log('Auth user deletion failed, but account data was cleaned up');
                }
            } else {
                console.log('Auth user deleted successfully from auth.users');
            }

        } catch (error) {
            console.error('Error deleting auth user:', error);
            // Don't fail here since account data is already deleted
            console.log('Auth user deletion failed, but account data was cleaned up');
        }

        // 5. Sign out the user
        await supabase.auth.signOut();

        return { success: true };

    } catch (error) {
        console.error('Error deleting account:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function getAccountData(): Promise<{
    success: boolean;
    data?: {
        createdAt: string;
        plan: string;
        emailsUsed: number;
        apiKeysCount: number;
        hasActiveSubscription: boolean;
    };
    error?: string;
}> {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Get account with subscription info
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select(`
        id,
        created_at,
        plan,
        emails_left,
        subscriptions (
          id,
          status,
          current_period_end
        )
      `)
            .eq('owner_id', user.id)
            .single();

        if (accountError || !account) {
            console.log('No account found for user, returning default data:', accountError);
            // Instead of returning error, return default data for new users
            return {
                success: true,
                data: {
                    createdAt: new Date().toISOString(),
                    plan: 'Free',
                    emailsUsed: 0,
                    apiKeysCount: 0,
                    hasActiveSubscription: false,
                }
            };
        }

        // Count API keys
        const { count: apiKeysCount } = await supabase
            .from('api_keys')
            .select('*', { count: 'exact', head: true })
            .eq('account_id', account.id)
            .eq('is_active', true);

        // Check if subscription is active
        const hasActiveSubscription = account.subscriptions?.some(
            (sub: any) => sub.status === 'active' && new Date(sub.current_period_end) > new Date()
        ) || false;

        // Calculate emails used (assuming 100 is the free limit)
        const emailsUsed = account.plan === 'Free' ? (100 - (account.emails_left || 0)) : 0;

        return {
            success: true,
            data: {
                createdAt: account.created_at,
                plan: account.plan,
                emailsUsed,
                apiKeysCount: apiKeysCount || 0,
                hasActiveSubscription,
            }
        };

    } catch (error) {
        console.error('Error getting account data:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function exportAccountData(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        console.log('Starting account data export...');
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Authentication error:', userError);
            return { success: false, error: 'Authentication required' };
        }

        console.log('User authenticated:', user.id);

        // Get account with all related data
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select(`
        *,
        subscriptions (*),
        api_keys (
          id,
          name,
          permissions,
          created_at,
          last_used_at,
          is_active
        )
      `)
            .eq('owner_id', user.id)
            .single();

        if (accountError || !account) {
            console.log('No account found for user, returning minimal export data:', accountError);
            // Instead of returning error, return minimal export data for new users
            return {
                success: true,
                data: {
                    account: {
                        id: 'N/A',
                        plan: 'Free',
                        billing_email: user.email,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        full_name: 'Not provided',
                        role: 'user',
                        emails_left: 100,
                        avatar_url: null,
                        provider: 'email',
                    },
                    user: {
                        id: user.id,
                        email: user.email,
                        created_at: user.created_at,
                        last_sign_in_at: user.last_sign_in_at,
                        provider: user.app_metadata?.provider,
                        email_verified: user.email_confirmed_at !== null,
                    },
                    subscriptions: [],
                    api_keys: [],
                    metadata: {
                        export_version: '1.0',
                        exported_at: new Date().toISOString(),
                        total_subscriptions: 0,
                        total_api_keys: 0,
                        note: 'Account data not yet created - showing default values'
                    },
                }
            };
        }

        console.log('Account data fetched successfully, preparing export...');

        // Prepare export data (remove sensitive information)
        const exportData = {
            account: {
                id: account.id,
                plan: account.plan || 'Free',
                billing_email: account.billing_email || account.owner_id,
                created_at: account.created_at,
                updated_at: account.updated_at,
                full_name: account.full_name || 'Not provided',
                role: account.role || 'user',
                emails_left: account.emails_left || 0,
                avatar_url: account.avatar_url,
                provider: account.provider,
            },
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
                last_sign_in_at: user.last_sign_in_at,
                provider: user.app_metadata?.provider,
                email_verified: user.email_confirmed_at !== null,
            },
            subscriptions: (account.subscriptions || []).map((sub: any) => ({
                id: sub.id,
                plan: sub.plan,
                status: sub.status,
                created_at: sub.created_at,
                current_period_start: sub.current_period_start,
                current_period_end: sub.current_period_end,
            })),
            api_keys: (account.api_keys || []).map((key: any) => ({
                id: key.id,
                name: key.name,
                permissions: key.permissions,
                created_at: key.created_at,
                last_used_at: key.last_used_at,
                is_active: key.is_active,
            })),
            metadata: {
                export_version: '1.0',
                exported_at: new Date().toISOString(),
                total_subscriptions: (account.subscriptions || []).length,
                total_api_keys: (account.api_keys || []).length,
            },
        };

        console.log('Export data prepared successfully');
        return {
            success: true,
            data: exportData
        };

    } catch (error) {
        console.error('Error exporting account data:', error);
        return {
            success: false,
            error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
