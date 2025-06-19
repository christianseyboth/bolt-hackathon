import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
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

        // Get the subscription (single source of truth for Stripe data)
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (subscriptionError || !subscription) {
            // Return empty invoices array instead of error if no subscription exists
            return NextResponse.json({
                success: true,
                invoices: [],
                message: 'No subscription found'
            });
        }

        if (!subscription.stripe_customer_id) {
            // Return empty invoices array instead of error if no Stripe customer ID
            return NextResponse.json({
                success: true,
                invoices: [],
                message: 'No Stripe customer found'
            });
        }

        // Fetch invoices from Stripe
        const invoices = await stripe.invoices.list({
            customer: subscription.stripe_customer_id,
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
