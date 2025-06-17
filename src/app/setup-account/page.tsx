import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function SetupAccountPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
        redirect('/login');
    }

    // Try to create the missing account and subscription
    try {
        console.log('🔧 Setting up account for user:', user.id);

        // Extract user info from OAuth metadata
        const userFullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'User';

        const userAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

        const provider = user.app_metadata?.provider || 'email';

        // Create account
        const { data: newAccount, error: createError } = await supabase
            .from('accounts')
            .insert({
                owner_id: user.id,
                billing_email: user.email,
                full_name: userFullName,
                avatar_url: userAvatarUrl,
                provider: provider,
                role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Failed to create account:', createError);
            throw createError;
        }

        console.log('✅ Account created:', newAccount.id);

        // Create subscription record
        const { data: newSubscription, error: subError } = await supabase
            .from('subscriptions')
            .insert({
                account_id: newAccount.id,
                plan_name: 'Free',
                subscription_status: 'active',
                seats: 1,
                price_per_seat: 0,
                total_price: 0,
                analysis_amount: 100,
                analysis_used: 0,
                emails_left: 100,
                current_period_start: new Date().toISOString(),
                cancel_at_period_end: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (subError) {
            console.error('❌ Failed to create subscription:', subError);
            throw subError;
        }

        console.log('✅ Subscription created:', newSubscription.id);

        // Redirect to subscription page
        redirect('/dashboard/subscription?setup=success');
    } catch (error) {
        console.error('❌ Setup failed:', error);

        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='max-w-md w-full space-y-8'>
                    <div>
                        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
                            Account Setup Failed
                        </h2>
                        <p className='mt-2 text-center text-sm text-gray-600'>
                            There was an error setting up your account. Please contact support.
                        </p>
                        <pre className='mt-4 text-xs text-red-600 bg-red-50 p-4 rounded'>
                            {error instanceof Error ? error.message : JSON.stringify(error)}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }
}
