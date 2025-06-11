'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    permissions: string[];
    last_used_at: string | null;
    created_at: string;
    expires_at: string | null;
    is_active: boolean;
    rate_limit: number;
}

export interface CreateApiKeyResult {
    success: boolean;
    error?: string;
    apiKey?: string; // Only returned once during creation
    keyData?: Omit<ApiKey, 'key_prefix'> & { key_prefix: string };
}

export async function createApiKey(
    name: string,
    permissions: string[] = ['read'],
    expiresAt?: string
): Promise<CreateApiKeyResult> {
    try {
        const supabase = createClient();

        // Get current user and account
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Get user's account
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('id, plan')
            .eq('owner_id', user.id)
            .single();

        if (accountError || !account) {
            return { success: false, error: 'Account not found' };
        }

        // Check API key limits based on plan
        const { data: existingKeys, error: countError } = await supabase
            .from('api_keys')
            .select('id')
            .eq('account_id', account.id)
            .eq('is_active', true);

        if (countError) {
            return { success: false, error: 'Failed to check existing keys' };
        }

        const keyLimit = account.plan === 'Free' ? 2 : account.plan === 'Pro' ? 10 : 50;
        if (existingKeys.length >= keyLimit) {
            return {
                success: false,
                error: `API key limit reached. ${account.plan} plan allows ${keyLimit} keys.`
            };
        }

        // Generate API key using database function
        const { data: keyResult, error: keyError } = await supabase
            .rpc('generate_api_key');

        if (keyError || !keyResult) {
            return { success: false, error: 'Failed to generate API key' };
        }

        const apiKey = keyResult as string;

        // Hash the key and get prefix
        const { data: hashResult, error: hashError } = await supabase
            .rpc('hash_api_key', { api_key: apiKey });

        const { data: prefixResult, error: prefixError } = await supabase
            .rpc('get_api_key_prefix', { api_key: apiKey });

        if (hashError || !hashResult || prefixError || !prefixResult) {
            return { success: false, error: 'Failed to process API key' };
        }

        // Insert the API key
        const { data: insertedKey, error: insertError } = await supabase
            .from('api_keys')
            .insert({
                account_id: account.id,
                name,
                key_hash: hashResult,
                key_prefix: prefixResult,
                permissions,
                expires_at: expiresAt || null,
            })
            .select()
            .single();

        if (insertError || !insertedKey) {
            return { success: false, error: 'Failed to create API key' };
        }

        revalidatePath('/dashboard/profile');

        return {
            success: true,
            apiKey, // Return the actual key only once
            keyData: insertedKey
        };

    } catch (error) {
        console.error('Error creating API key:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function listApiKeys(): Promise<{ success: boolean; keys?: ApiKey[]; error?: string }> {
    try {
        const supabase = createClient();

        // Get current user and account
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

        // Fetch API keys
        const { data: keys, error: keysError } = await supabase
            .from('api_keys')
            .select('id, name, key_prefix, permissions, last_used_at, created_at, expires_at, is_active, rate_limit')
            .eq('account_id', account.id)
            .order('created_at', { ascending: false });

        if (keysError) {
            return { success: false, error: 'Failed to fetch API keys' };
        }

        return { success: true, keys: keys || [] };

    } catch (error) {
        console.error('Error listing API keys:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function revokeApiKey(keyId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();

        // Get current user and account
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

        // Revoke the API key (soft delete by setting is_active to false)
        const { error: revokeError } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', keyId)
            .eq('account_id', account.id);

        if (revokeError) {
            return { success: false, error: 'Failed to revoke API key' };
        }

        revalidatePath('/dashboard/profile');
        return { success: true };

    } catch (error) {
        console.error('Error revoking API key:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function updateApiKeyName(
    keyId: string,
    newName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();

        // Get current user and account
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

        // Update the API key name
        const { error: updateError } = await supabase
            .from('api_keys')
            .update({ name: newName })
            .eq('id', keyId)
            .eq('account_id', account.id);

        if (updateError) {
            return { success: false, error: 'Failed to update API key name' };
        }

        revalidatePath('/dashboard/profile');
        return { success: true };

    } catch (error) {
        console.error('Error updating API key name:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function validateApiKeyAction(apiKey: string): Promise<{
    success: boolean;
    account_id?: string;
    permissions?: string[];
    rate_limit?: number;
    error?: string;
}> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .rpc('validate_api_key', { api_key: apiKey });

        if (error) {
            return { success: false, error: 'Invalid API key' };
        }

        if (!data || data.length === 0 || !data[0].is_valid) {
            return { success: false, error: 'API key is invalid or expired' };
        }

        const keyData = data[0];
        return {
            success: true,
            account_id: keyData.account_id,
            permissions: keyData.permissions,
            rate_limit: keyData.rate_limit
        };

    } catch (error) {
        console.error('Error validating API key:', error);
        return { success: false, error: 'Internal server error' };
    }
}
