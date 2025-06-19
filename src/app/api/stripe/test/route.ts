import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
});

export async function GET() {
    try {
        // Test basic Stripe connection
        const products = await stripe.products.list({ limit: 3 });
        const prices = await stripe.prices.list({ limit: 10 });

        return NextResponse.json({
            success: true,
            stripe_connected: true,
            products_count: products.data.length,
            prices_count: prices.data.length,
            products: products.data.map(p => ({
                id: p.id,
                name: p.name,
                active: p.active
            })),
            prices: prices.data.map(p => ({
                id: p.id,
                product: p.product,
                amount: p.unit_amount,
                currency: p.currency,
                interval: p.recurring?.interval,
                active: p.active
            }))
        });
    } catch (error) {
        console.error('Stripe test error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stripe_connected: false
        }, { status: 500 });
    }
}
