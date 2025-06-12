import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get account ID from request body
        const { accountId } = await request.json();

        if (!accountId) {
            return NextResponse.json(
                { error: 'Account ID is required' },
                { status: 400 }
            );
        }

        // Get the account
        const { data: account, error: accountError } = await supabase
            .from('accounts')
            .select('stripe_customer_id')
            .eq('id', accountId)
            .single();

        if (accountError || !account) {
            return NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            );
        }

        if (!account.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No Stripe customer found' },
                { status: 400 }
            );
        }

        // Fetch invoices from Stripe
        const invoices = await stripe.invoices.list({
            customer: account.stripe_customer_id,
            limit: 10,
            expand: ['data.subscription']
        });

        // Format invoice data
        const formattedInvoices = invoices.data.map(invoice => ({
            id: invoice.id,
            number: invoice.number,
            amount_paid: invoice.amount_paid,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
            status: invoice.status,
            created: invoice.created,
            due_date: invoice.due_date,
            hosted_invoice_url: invoice.hosted_invoice_url,
            invoice_pdf: invoice.invoice_pdf,
            period_start: invoice.period_start,
            period_end: invoice.period_end,
            subscription_id: typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id,
            description: invoice.lines.data[0]?.description || 'Subscription',
        }));

        return NextResponse.json({
            success: true,
            invoices: formattedInvoices
        });

    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}
