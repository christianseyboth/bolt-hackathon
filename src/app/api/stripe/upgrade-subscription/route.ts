import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
    try {
        const { newPriceId, accountId } = await request.json();
        console.log('🚀 Upgrade request received:', { newPriceId, accountId });

        if (!newPriceId || !accountId) {
            console.log('❌ Missing parameters:', { newPriceId, accountId });
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get account data first (accounts table has the basic account info)
        console.log('🔍 Fetching account data for accountId:', accountId);
        let { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        console.log('📋 Account lookup result:', {
            account: account ? {
                id: account.id,
                billing_email: account.billing_email,
                owner_id: account.owner_id
            } : null,
            error: accountError
        });

        if (accountError || !account) {
            console.log('❌ Account not found for ID:', accountId, 'Error:', accountError);

            // Try to get user and create account if this is a new OAuth user
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                return NextResponse.json({
                    error: 'Authentication required',
                    message: 'Please sign in to continue'
                }, { status: 401 });
            }

            // Check if account ID matches user ID (for new users, they might pass user ID as account ID)
            if (accountId === user.id) {
                console.log('🆕 Creating account for new OAuth user:', user.id);

                try {
                    // Extract user info from OAuth metadata
                    const userFullName = user.user_metadata?.full_name ||
                                        user.user_metadata?.name ||
                                        user.email?.split('@')[0] || 'User';

                    const userAvatarUrl = user.user_metadata?.avatar_url ||
                                        user.user_metadata?.picture ||
                                        null;

                    const provider = user.app_metadata?.provider || 'email';

                    // Create new account
                    const { data: newAccount, error: createError } = await supabase
                        .from('accounts')
                        .insert({
                            owner_id: user.id,
                            billing_email: user.email,
                            full_name: userFullName,
                            avatar_url: userAvatarUrl,
                            provider: provider,
                            plan: 'Free',
                            role: 'owner',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .select()
                        .single();

                    if (createError || !newAccount) {
                        console.error('❌ Failed to create account:', createError);
                        return NextResponse.json({
                            error: 'Failed to create account',
                            message: 'Please try again or contact support'
                        }, { status: 500 });
                    }

                    account = newAccount;
                    console.log('✅ Account created successfully:', account.id);

                } catch (error) {
                    console.error('❌ Error creating account for OAuth user:', error);
                    return NextResponse.json({
                        error: 'Failed to create account',
                        message: 'Please try again or contact support'
                    }, { status: 500 });
                }
            } else {
                return NextResponse.json({
                    error: 'Account not found',
                    message: `No account found with ID: ${accountId}`,
                    accountId: accountId
                }, { status: 404 });
            }
        }

        // Get subscription data (our main source of truth for Stripe info)
        console.log('🔍 Fetching subscription data for account:', accountId);
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        let currentSubscription = subscription;

        if (subscriptionError || !subscription) {
            console.log('❌ Subscription lookup failed:', {
                subscriptionError,
                subscription: subscription?.id,
                stripe_customer_id: subscription?.stripe_customer_id,
                accountId
            });

            // If no subscription exists, create a basic one first
            if (!subscription) {
                console.log('🆕 No subscription record found, creating initial free subscription...');

                // Create Stripe customer with billing information (since no subscription exists yet)
                console.log('🆕 Creating Stripe customer with billing info...');
                let stripeCustomerId;
                try {
                    const customerData: Stripe.CustomerCreateParams = {
                        email: account.billing_email,
                        metadata: {
                            account_id: accountId,
                            billing_type: account.billing_type || 'individual',
                        }
                    };

                    // Set name and address based on billing type
                    if (account.billing_type === 'business' && account.company_name) {
                        customerData.name = account.company_name;

                        // Add business address if available
                        if (account.company_address_line1) {
                            customerData.address = {
                                line1: account.company_address_line1,
                                line2: account.company_address_line2 || undefined,
                                city: account.company_city || undefined,
                                state: account.company_state || undefined,
                                postal_code: account.company_postal_code || undefined,
                                country: account.company_country || 'US',
                            };
                        }

                        // Add tax ID if available
                        if (account.company_tax_id) {
                            (customerData.metadata as any).tax_id = account.company_tax_id;
                        }

                        // Add VAT number if available
                        if (account.vat_number) {
                            (customerData.metadata as any).vat_number = account.vat_number;
                        }
                    } else {
                        // Individual billing
                        customerData.name = account.full_name || account.billing_email;
                    }

                    const customer = await stripe.customers.create(customerData);
                    stripeCustomerId = customer.id;
                    console.log('✅ Stripe customer created with billing info:', {
                        customerId: stripeCustomerId,
                        billingType: account.billing_type,
                        companyName: account.company_name,
                        hasAddress: !!account.company_address_line1,
                    });
                } catch (error) {
                    console.error('❌ Failed to create Stripe customer:', error);
                    return NextResponse.json({
                        error: 'Failed to create Stripe customer',
                        message: 'Please try again or contact support'
                    }, { status: 500 });
                }

                // Create initial subscription record
                const { data: newSubscription, error: insertError } = await supabase
                    .from('subscriptions')
                    .insert({
                        account_id: accountId,
                        plan_name: 'Free',
                        subscription_status: 'active',
                        seats: 1,
                        price_per_seat: 0,
                        total_price: 0,
                        analysis_amount: 5,
                        analysis_used: 0,
                        emails_left: 5,
                        stripe_customer_id: stripeCustomerId,
                        current_period_start: new Date().toISOString(),
                        cancel_at_period_end: false,
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('❌ Failed to create subscription record:', insertError);
                    return NextResponse.json({
                        error: 'Failed to create subscription record',
                        message: 'Please try again or contact support'
                    }, { status: 500 });
                }

                currentSubscription = newSubscription;
                console.log('✅ Initial subscription created:', newSubscription.id);
            }

                        // If subscription exists but no stripe_customer_id, redirect to checkout
            if (currentSubscription && !currentSubscription.stripe_customer_id) {
                console.log('🔄 Subscription exists but no Stripe customer ID, redirecting to checkout...');
                return NextResponse.json({
                    error: 'No payment method found',
                    needsCheckout: true,
                    message: 'Please complete checkout to set up your payment method and upgrade your subscription'
                }, { status: 402 }); // 402 Payment Required
            }
        }

        console.log('✅ Account and subscription found:', {
            account_id: account.id,
            billing_email: account.billing_email,
            stripe_customer_id: currentSubscription.stripe_customer_id,
            current_plan: currentSubscription.plan_name
        });

        // Sync billing information to Stripe customer before processing upgrade
        console.log('🔄 Syncing billing information to Stripe...');
        try {
            const updateData: Stripe.CustomerUpdateParams = {
                email: account.billing_email,
                metadata: {
                    account_id: accountId,
                    billing_type: account.billing_type || 'individual',
                },
            };

            if (account.billing_type === 'business' && account.company_name) {
                // Business billing
                updateData.name = account.company_name;

                // Add business address if available
                if (account.company_address_line1) {
                    updateData.address = {
                        line1: account.company_address_line1,
                        line2: account.company_address_line2 || undefined,
                        city: account.company_city || undefined,
                        state: account.company_state || undefined,
                        postal_code: account.company_postal_code || undefined,
                        country: account.company_country || 'US',
                    };
                }

                // Add tax ID if available
                if (account.company_tax_id) {
                    (updateData.metadata as any).tax_id = account.company_tax_id;
                }

                // Add VAT number if available
                if (account.vat_number) {
                    (updateData.metadata as any).vat_number = account.vat_number;
                }
            } else {
                // Individual billing
                updateData.name = account.full_name || account.billing_email;
            }

            await stripe.customers.update(currentSubscription.stripe_customer_id, updateData);

            console.log('✅ Billing info synced to Stripe:', {
                customerId: currentSubscription.stripe_customer_id,
                billingType: account.billing_type,
                companyName: account.company_name,
                hasAddress: !!account.company_address_line1,
            });
        } catch (error) {
            console.error('⚠️ Failed to sync billing info, but continuing:', error);
            // Don't fail the upgrade if billing sync fails
        }

        // Check if customer has a default payment method
        console.log('🔍 Checking customer payment methods...');

        // If no stripe_customer_id, redirect to checkout to create customer
        if (!currentSubscription.stripe_customer_id) {
            console.log('🔄 No Stripe customer ID found, redirecting to checkout to create customer...');
            return NextResponse.json({
                error: 'No payment method found',
                needsCheckout: true,
                message: 'Please complete checkout to set up your payment method and upgrade your subscription'
            }, { status: 402 }); // 402 Payment Required
        }

        // Get the customer to check for default payment method
        const customer = await stripe.customers.retrieve(currentSubscription.stripe_customer_id);

        // Also get payment methods attached to customer
        const paymentMethods = await stripe.paymentMethods.list({
            customer: currentSubscription.stripe_customer_id,
            type: 'card',
        });

        const hasDefaultPaymentMethod = (customer as any).invoice_settings?.default_payment_method ||
                                       (customer as any).default_source;

        console.log('💳 Payment method status:', {
            payment_methods_count: paymentMethods.data.length,
            has_default_payment_method: !!hasDefaultPaymentMethod,
            default_payment_method_id: hasDefaultPaymentMethod,
            customer_default_source: (customer as any).default_source,
            available_payment_methods: paymentMethods.data.map(pm => ({
                id: pm.id,
                type: pm.type,
                card_last4: pm.card?.last4
            }))
        });

        // If no payment methods at all, redirect to checkout
        if (paymentMethods.data.length === 0) {
            console.log('❌ No payment methods found, redirecting to checkout...');
            return NextResponse.json({
                error: 'No payment method found',
                needsCheckout: true,
                message: 'Please add a payment method to upgrade your subscription'
            }, { status: 402 }); // 402 Payment Required
        }

        // If we have payment methods but no default, set the first one as default
        if (!hasDefaultPaymentMethod && paymentMethods.data.length > 0) {
            console.log('🔧 No default payment method set, setting first available as default...');
            try {
                await stripe.customers.update(currentSubscription.stripe_customer_id, {
                    invoice_settings: {
                        default_payment_method: paymentMethods.data[0].id
                    }
                });
                console.log('✅ Default payment method set to:', paymentMethods.data[0].id);
            } catch (error) {
                console.error('❌ Failed to set default payment method:', error);
                return NextResponse.json({
                    error: 'Failed to set default payment method',
                    needsCheckout: true,
                    message: 'Please set a default payment method first'
                }, { status: 402 });
            }
        }

        // Get current subscriptions from Stripe (including cancelled ones we might want to reactivate)
        console.log('🔍 Checking Stripe for subscriptions...');
        const activeSubscriptions = await stripe.subscriptions.list({
            customer: currentSubscription.stripe_customer_id,
            status: 'active',
            limit: 1,
        });

        const cancelledSubscriptions = await stripe.subscriptions.list({
            customer: currentSubscription.stripe_customer_id,
            status: 'canceled',
            limit: 1,
        });

        console.log('📋 Stripe subscriptions found:', {
            activeCount: activeSubscriptions.data.length,
            cancelledCount: cancelledSubscriptions.data.length,
            activeSubscriptions: activeSubscriptions.data.map(sub => ({
                id: sub.id,
                status: sub.status,
                price_id: sub.items.data[0]?.price.id
            })),
            cancelledSubscriptions: cancelledSubscriptions.data.map(sub => ({
                id: sub.id,
                status: sub.status,
                price_id: sub.items.data[0]?.price.id
            }))
        });

        let updatedSubscription;
        let isNewSubscription = false;

        if (activeSubscriptions.data.length > 0) {
            // Existing active subscription - upgrade it
            console.log('🔄 Found active subscription, upgrading...');
            const existingSubscription = activeSubscriptions.data[0];
            const currentSubscriptionItem = existingSubscription.items.data[0];

            console.log('📝 Current subscription details:', {
                id: existingSubscription.id,
                status: existingSubscription.status,
                current_price_id: currentSubscriptionItem.price.id,
                new_price_id: newPriceId
            });

            try {
                // Upgrade/downgrade with immediate proration
                updatedSubscription = await stripe.subscriptions.update(existingSubscription.id, {
                    items: [{
                        id: currentSubscriptionItem.id,
                        price: newPriceId,
                    }],
                    proration_behavior: 'always_invoice', // Immediate upgrade with proration
                    expand: ['items.data.price']
                });
                console.log('✅ Subscription upgraded successfully');
            } catch (stripeError) {
                console.error('❌ Stripe upgrade error:', stripeError);
                return NextResponse.json({
                    error: 'Failed to upgrade subscription in Stripe',
                    details: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
                }, { status: 500 });
            }
        } else if (cancelledSubscriptions.data.length > 0) {
            // Has cancelled subscription - create new subscription (Stripe best practice)
            console.log('🔄 Found cancelled subscription, creating new subscription instead of reactivating...');
            const cancelledSub = cancelledSubscriptions.data[0];
            console.log('📝 Cancelled subscription details:', {
                id: cancelledSub.id,
                status: cancelledSub.status,
                ended_at: cancelledSub.ended_at
            });

            isNewSubscription = true;

            try {
                // Create new subscription (don't reactivate cancelled ones)
                updatedSubscription = await stripe.subscriptions.create({
                    customer: currentSubscription.stripe_customer_id,
                    items: [{
                        price: newPriceId,
                    }],
                    expand: ['items.data.price']
                });
                console.log('✅ New subscription created successfully:', updatedSubscription.id);
            } catch (stripeError) {
                console.error('❌ Stripe creation error:', stripeError);
                return NextResponse.json({
                    error: 'Failed to create new subscription in Stripe',
                    details: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
                }, { status: 500 });
            }
        } else {
            // No subscription at all - create a new one
            console.log('🆕 No subscription found, creating new subscription...');
            isNewSubscription = true;

            try {
                // Create new subscription
                updatedSubscription = await stripe.subscriptions.create({
                    customer: currentSubscription.stripe_customer_id,
                    items: [{
                        price: newPriceId,
                    }],
                    expand: ['items.data.price']
                });
                console.log('✅ New subscription created successfully:', updatedSubscription.id);
            } catch (stripeError) {
                console.error('❌ Stripe creation error:', stripeError);
                return NextResponse.json({
                    error: 'Failed to create new subscription in Stripe',
                    details: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
                }, { status: 500 });
            }
        }

        // Update database immediately
        console.log('💾 Updating database...');
        const planName = getPlanNameFromPriceId(newPriceId);
        console.log('📋 Plan mapping:', { newPriceId, planName });

        const subscriptionData = {
            plan_name: planName,
            seats: getSeatsFromPlan(planName),
            price_per_seat: updatedSubscription.items.data[0]?.price.unit_amount ? updatedSubscription.items.data[0].price.unit_amount / 100 : 0,
            total_price: updatedSubscription.items.data[0]?.price.unit_amount ? updatedSubscription.items.data[0].price.unit_amount / 100 : 0,
            analysis_amount: getAnalysisAmountFromPlan(planName),
            subscription_status: updatedSubscription.status,
            stripe_subscription_id: updatedSubscription.id,
            current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: updatedSubscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
        };

        console.log('📝 Subscription data to save:', subscriptionData);

        // Always update the existing subscription record (never create new database records)
        // Even when creating a new Stripe subscription, we update the existing database record
        console.log('🔄 Updating subscription record in database...');
        console.log('📝 Updating with new Stripe subscription ID:', updatedSubscription.id);

        const { data: updateResult, error: updateError } = await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('account_id', accountId)
            .select();

        if (updateError) {
            console.error('❌ Database update error:', updateError);
            console.error('❌ Update failed for accountId:', accountId);
            console.error('❌ Update data was:', subscriptionData);
            // Don't fail the request - webhook will handle it
        } else {
            console.log('✅ Subscription record updated successfully');
            console.log('✅ Update result:', updateResult);
            console.log('✅ Updated rows count:', updateResult?.length || 0);
            console.log('✅ Database now points to new Stripe subscription:', updatedSubscription.id);

            if (!updateResult || updateResult.length === 0) {
                console.error('⚠️ WARNING: Update succeeded but no rows were affected!');
                console.error('⚠️ This suggests the accountId lookup failed:', accountId);
            }
        }

        // ✅ REMOVED: No longer update accounts table - subscriptions table is single source of truth
        console.log('✅ Subscription data updated in subscriptions table only');

        const response = {
            success: true,
            message: isNewSubscription ? 'New subscription created successfully' : 'Subscription upgraded successfully',
            subscription: {
                id: updatedSubscription.id,
                plan_name: planName,
                seats: getSeatsFromPlan(planName),
                status: updatedSubscription.status,
                isNew: isNewSubscription
            }
        };

        console.log('🎉 Upgrade completed successfully:', response);
        return NextResponse.json(response);

    } catch (error) {
        console.error('❌ Unexpected upgrade error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json({
            error: 'Failed to upgrade subscription',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

function getPlanNameFromPriceId(priceId: string): string {
    const priceToplanMap: Record<string, string> = {
        'price_1RZ9HkCsZBRpsVkXiDJ1KICM': 'Team',
        'price_1RZ9HkCsZBRpsVkXBQNNjw87': 'Team',
        'price_1RZ9EoCsZBRpsVkXVniKqUeU': 'Entrepreneur',
        'price_1RZ9EoCsZBRpsVkXxzMu3paC': 'Entrepreneur',
        'price_1RZ9CfCsZBRpsVkXUefPaqVu': 'Solo',
        'price_1RZ9CfCsZBRpsVkXt0nTDOee': 'Solo',
    };

    return priceToplanMap[priceId] || 'Free';
}

function getSeatsFromPlan(planName: string): number {
    const planSeats: Record<string, number> = {
        'Free': 1,
        'Solo': 1,
        'Entrepreneur': 5,
        'Team': 20,
    };

    return planSeats[planName] || 1;
}

function getAnalysisAmountFromPlan(planName: string): number {
    const planLimits: Record<string, number> = {
        'Free': 100,
        'Solo': 1000,
        'Entrepreneur': 5000,
        'Team': 20000,
    };

    return planLimits[planName] || 100;
}
