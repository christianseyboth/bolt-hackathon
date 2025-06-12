import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function GET() {
    try {
        // Get all products with their prices
        const products = await stripe.products.list({ active: true });
        const prices = await stripe.prices.list({ active: true });

        const productPriceMapping = products.data.map(product => {
            const productPrices = prices.data.filter(price => {
                const productId = typeof price.product === 'string' ? price.product : price.product.id;
                return productId === product.id;
            });

            return {
                product_name: product.name,
                product_id: product.id,
                prices: productPrices.map(price => ({
                    price_id: price.id,
                    amount: price.unit_amount,
                    currency: price.currency,
                    interval: price.recurring?.interval,
                    active: price.active
                }))
            };
        });

        // Generate the webhook mapping code
        const webhookMapping = products.data.reduce((acc, product) => {
            const productPrices = prices.data.filter(price => {
                const productId = typeof price.product === 'string' ? price.product : price.product.id;
                return productId === product.id;
            });

            productPrices.forEach(price => {
                const interval = price.recurring?.interval === 'month' ? 'MONTHLY' : 'YEARLY';
                const key = `'${price.id}': '${product.name}', // ${product.name} ${interval}`;
                acc.push(key);
            });

            return acc;
        }, [] as string[]);

        return NextResponse.json({
            success: true,
            products_with_prices: productPriceMapping,
            webhook_mapping_code: `
const priceToplanMap: Record<string, string> = {
    ${webhookMapping.join('\n    ')}
};
            `.trim()
        });
    } catch (error) {
        console.error('Error fetching price mapping:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
