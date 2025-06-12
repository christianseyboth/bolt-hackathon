import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function GET() {
    try {
        // Fetch products with prices
        const { data: products } = await stripe.products.list({
            active: true,
            expand: ['data.default_price'],
        });

        console.log('Raw products from Stripe:', products.length);
        console.log('Products:', products.map(p => ({ id: p.id, name: p.name })));

        // Fetch all prices for products
        const { data: prices } = await stripe.prices.list({
            active: true,
            expand: ['data.product'],
        });

        console.log('Raw prices from Stripe:', prices.length);
        console.log('Prices:', prices.map(p => ({
            id: p.id,
            product: p.product,
            amount: p.unit_amount,
            interval: p.recurring?.interval
        })));

                // Group prices by product
        const productsWithPrices = products.map(product => {
            const productPrices = prices.filter(price => {
                // Handle both string and object product references
                const productId = typeof price.product === 'string' ? price.product : price.product.id;
                return productId === product.id;
            });
            console.log(`Product ${product.name} (${product.id}) has ${productPrices.length} prices`);

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                metadata: product.metadata,
                prices: productPrices.map(price => ({
                    id: price.id,
                    amount: price.unit_amount || 0,
                    currency: price.currency,
                    interval: price.recurring?.interval || null,
                    interval_count: price.recurring?.interval_count || null,
                })),
            };
        });

        console.log('Final products with prices:', productsWithPrices.map(p => ({
            name: p.name,
            priceCount: p.prices.length,
            prices: p.prices
        })));

        return NextResponse.json({ products: productsWithPrices });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
