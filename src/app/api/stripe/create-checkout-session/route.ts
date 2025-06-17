import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil' as any,
});

export async function POST(request: NextRequest) {
    try {
        const { priceId, accountId } = await request.json();

        if (!priceId || !accountId) {
            return NextResponse.json(
                { error: 'Price ID and Account ID are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get the account to get user details
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (accountError || !account) {
            return NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            );
        }

        // Get user details
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        let customerId = account.stripe_customer_id;

        // Create or update Stripe customer with billing information
        if (!customerId) {
            // Create customer with complete billing information
            const customerData: Stripe.CustomerCreateParams = {
                email: account.billing_email || user.email,
                metadata: {
                    accountId: accountId,
                    userId: user.id,
                    billing_type: account.billing_type || 'individual',
                },
            };

            // Set name based on billing type
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
                if (account.company_tax_id && customerData.metadata) {
                    customerData.metadata.tax_id = account.company_tax_id;
                }

                // Add VAT number if available
                if (account.vat_number && customerData.metadata) {
                    customerData.metadata.vat_number = account.vat_number;
                }
            } else {
                // Individual billing
                customerData.name = account.full_name || user.email;
            }

            const customer = await stripe.customers.create(customerData);
            customerId = customer.id;

            // Update account with customer ID
            await supabase
                .from('accounts')
                .update({ stripe_customer_id: customerId })
                .eq('id', accountId);

            console.log('✅ Created Stripe customer with billing info:', {
                customerId,
                billingType: account.billing_type,
                companyName: account.company_name,
                hasAddress: !!account.company_address_line1,
            });
        } else {
            // Update existing customer with latest billing information
            const updateData: Stripe.CustomerUpdateParams = {
                email: account.billing_email || user.email,
                metadata: {
                    accountId: accountId,
                    userId: user.id,
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
                if (account.company_tax_id && updateData.metadata) {
                    updateData.metadata.tax_id = account.company_tax_id;
                }

                // Add VAT number if available
                if (account.vat_number && updateData.metadata) {
                    updateData.metadata.vat_number = account.vat_number;
                }
            } else {
                // Individual billing
                updateData.name = account.full_name || user.email;
            }

            await stripe.customers.update(customerId, updateData);

            console.log('✅ Updated Stripe customer with billing info:', {
                customerId,
                billingType: account.billing_type,
                companyName: account.company_name,
                hasAddress: !!account.company_address_line1,
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/subscription?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/subscription?canceled=true`,
            metadata: {
                accountId: accountId,
                userId: user.id,
            },
            // Include billing information collection if needed
            billing_address_collection: account.billing_type === 'business' ? 'required' : 'auto',
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
