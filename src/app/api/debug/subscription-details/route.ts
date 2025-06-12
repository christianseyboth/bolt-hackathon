import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
    try {
        const { accountId } = await request.json();

        const supabase = await createClient();
        const { data: account } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .single();

        if (!account?.stripe_customer_id) {
            return NextResponse.json({ error: 'No Stripe customer ID' }, { status: 400 });
        }

        // Method 1: List subscriptions
        console.log('🔍 Method 1: Listing subscriptions...');
        const subscriptionsList = await stripe.subscriptions.list({
            customer: account.stripe_customer_id,
            limit: 1
        });

        const listSub = subscriptionsList.data[0];
        console.log('List method result:', {
            id: listSub?.id,
            status: listSub?.status,
            current_period_start: listSub?.current_period_start,
            current_period_end: listSub?.current_period_end,
            created: listSub?.created
        });

        // Method 2: Retrieve subscription directly
        if (listSub) {
            console.log('🔍 Method 2: Retrieving subscription directly...');
            const retrievedSub = await stripe.subscriptions.retrieve(listSub.id);
            console.log('Retrieve method result:', {
                id: retrievedSub.id,
                status: retrievedSub.status,
                current_period_start: retrievedSub.current_period_start,
                current_period_end: retrievedSub.current_period_end,
                created: retrievedSub.created
            });

            // Method 3: Retrieve with expand
            console.log('🔍 Method 3: Retrieving with expand...');
            const expandedSub = await stripe.subscriptions.retrieve(listSub.id, {
                expand: ['items.data.price']
            });
            console.log('Expanded method result:', {
                id: expandedSub.id,
                status: expandedSub.status,
                current_period_start: expandedSub.current_period_start,
                current_period_end: expandedSub.current_period_end,
                created: expandedSub.created,
                items_count: expandedSub.items.data.length,
                price_id: expandedSub.items.data[0]?.price.id
            });

            return NextResponse.json({
                success: true,
                methods: {
                    list: {
                        current_period_start: listSub.current_period_start,
                        current_period_end: listSub.current_period_end,
                        type_start: typeof listSub.current_period_start,
                        type_end: typeof listSub.current_period_end
                    },
                    retrieve: {
                        current_period_start: retrievedSub.current_period_start,
                        current_period_end: retrievedSub.current_period_end,
                        type_start: typeof retrievedSub.current_period_start,
                        type_end: typeof retrievedSub.current_period_end
                    },
                    expanded: {
                        current_period_start: expandedSub.current_period_start,
                        current_period_end: expandedSub.current_period_end,
                        type_start: typeof expandedSub.current_period_start,
                        type_end: typeof expandedSub.current_period_end
                    }
                }
            });
        }

        return NextResponse.json({ error: 'No subscription found' }, { status: 404 });

    } catch (error) {
        console.error('❌ Subscription details error:', error);
        return NextResponse.json({
            error: 'Failed to get subscription details',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
