import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil' as any,
});

export async function POST(request: NextRequest) {
    try {
        const { accountId } = await request.json();

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get account with billing information
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (accountError || !account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // If no Stripe customer exists, create one
        let customerId = account.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: account.billing_email,
                name: account.billing_type === 'business' ? account.company_name : account.full_name,
                metadata: {
                    account_id: accountId,
                    billing_type: account.billing_type,
                },
            });
            customerId = customer.id;

            // Update account with new customer ID
            await supabase
                .from('accounts')
                .update({ stripe_customer_id: customerId })
                .eq('id', accountId);
        }

        // Prepare customer update data based on billing type
        const updateData: Stripe.CustomerUpdateParams = {
            email: account.billing_email,
            metadata: {
                account_id: accountId,
                billing_type: account.billing_type,
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

        // Update Stripe customer
        const updatedCustomer = await stripe.customers.update(customerId, updateData);

        console.log('✅ Billing info synced to Stripe:', {
            customerId,
            billingType: account.billing_type,
            companyName: account.company_name,
            hasAddress: !!account.company_address_line1,
        });

        return NextResponse.json({
            success: true,
            customerId,
            billingType: account.billing_type,
            customer: updatedCustomer,
        });

    } catch (error) {
        console.error('❌ Stripe billing sync error:', error);
        return NextResponse.json({
            error: 'Failed to sync billing information',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
