import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil' as any,
});

export async function POST(request: NextRequest) {
    try {
        const { newPriceId, accountId, effectiveDate } = await request.json();
        console.log('🔽 Downgrade schedule request received:', { newPriceId, accountId, effectiveDate });

        if (!newPriceId || !accountId) {
            console.log('❌ Missing parameters:', { newPriceId, accountId });
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get subscription data
        console.log('🔍 Fetching subscription data for account:', accountId);
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('account_id', accountId)
            .single();

        if (subscriptionError || !subscription) {
            console.log('❌ Subscription lookup failed:', subscriptionError);
            return NextResponse.json({
                error: 'Subscription not found',
                message: `No subscription found with account ID: ${accountId}`
            }, { status: 404 });
        }

        if (!subscription.stripe_subscription_id) {
            console.log('❌ No Stripe subscription ID found');
            return NextResponse.json({
                error: 'No Stripe subscription found',
                message: 'Please sync your subscription first'
            }, { status: 404 });
        }

        console.log('✅ Subscription found:', {
            subscription_id: subscription.stripe_subscription_id,
            current_plan: subscription.plan_name,
            current_period_end: subscription.current_period_end
        });

        // Get the current subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

        console.log('📋 Current Stripe subscription:', {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            current_price_id: stripeSubscription.items.data[0]?.price.id
        });

                        // Check if subscription already has a schedule
        console.log('🔍 Checking if subscription already has a schedule...');
        let existingScheduleId = null;

                try {
            // Get the subscription details to check if it has a schedule
            const fullSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id, {
                expand: ['schedule']
            });

            if (fullSubscription.schedule) {
                existingScheduleId = typeof fullSubscription.schedule === 'string'
                    ? fullSubscription.schedule
                    : fullSubscription.schedule.id;
                console.log('📋 Found existing schedule:', existingScheduleId);
            }
        } catch (error) {
            console.log('⚠️ Could not check for existing schedules:', error);
            // If we can't check, we know from the error message there IS a schedule
            // Extract it from the error message if possible
            const errorMessage = error instanceof Error ? error.message : String(error);
            const scheduleMatch = errorMessage.match(/sub_sched_[a-zA-Z0-9]+/);
            if (scheduleMatch) {
                existingScheduleId = scheduleMatch[0];
                console.log('📋 Extracted schedule ID from error:', existingScheduleId);
            }
        }

        let updatedSchedule;

        if (existingScheduleId) {
            // Update existing schedule
            console.log('🔄 Updating existing subscription schedule...');

            // First, get the existing schedule to see its current structure
            const existingSchedule = await stripe.subscriptionSchedules.retrieve(existingScheduleId);
            console.log('📋 Existing schedule structure:', {
                id: existingSchedule.id,
                phases: existingSchedule.phases.length,
                current_phase: existingSchedule.current_phase
            });

            // For existing schedules, we need to be careful about the current phase
            // We cannot modify the start_date of a phase that has already started
            const currentTime = Math.floor(Date.now() / 1000);
            const isCurrentPhaseStarted = existingSchedule.current_phase &&
                existingSchedule.current_phase.start_date <= currentTime;

            console.log('⏰ Phase timing check:', {
                current_time: currentTime,
                current_phase_start: existingSchedule.current_phase?.start_date,
                current_phase_end: existingSchedule.current_phase?.end_date,
                is_phase_started: isCurrentPhaseStarted
            });

                        if (isCurrentPhaseStarted) {
                // If current phase has started, we need to use the 'release' method to modify the schedule
                console.log('⚠️ Current phase has started, releasing schedule and creating new one...');

                                                // Release the existing schedule to detach it from the subscription
                await stripe.subscriptionSchedules.release(existingScheduleId);
                console.log('✅ Released existing schedule');

                // Create a new schedule from subscription (this creates default phases)
                const newSchedule = await stripe.subscriptionSchedules.create({
                    from_subscription: subscription.stripe_subscription_id,
                });
                console.log('✅ Created new schedule:', newSchedule.id);

                // Now add the downgrade phase to the newly created schedule
                // We can't modify the current phase, but we can add future phases
                updatedSchedule = await stripe.subscriptionSchedules.update(newSchedule.id, {
                    phases: [
                        // Keep the existing phase (clean it of empty properties)
                        ...(newSchedule.phases.map(phase => ({
                            items: phase.items as any,
                            start_date: phase.start_date,
                            end_date: phase.end_date,
                            ...(phase.collection_method && { collection_method: phase.collection_method }),
                            ...(phase.invoice_settings && { invoice_settings: phase.invoice_settings as any }),
                        })) as any),
                        {
                            // Add new phase - downgraded plan starts after current period
                            items: [{
                                price: newPriceId,
                                quantity: 1,
                            }],
                            start_date: stripeSubscription.current_period_end,
                        }
                    ],
                });
            } else {
                // If current phase hasn't started yet, we can replace all phases
                console.log('✅ Current phase not started, replacing all phases...');
                updatedSchedule = await stripe.subscriptionSchedules.update(existingScheduleId, {
                    phases: [
                        {
                            // Current phase - keep existing plan until period end
                            items: stripeSubscription.items.data.map(item => ({
                                price: item.price.id,
                                quantity: item.quantity || 1,
                            })),
                            start_date: Math.floor(Date.now() / 1000), // Start immediately
                            end_date: stripeSubscription.current_period_end, // End at current period end
                        },
                        {
                            // New phase - downgraded plan starts after current period
                            items: [{
                                price: newPriceId,
                                quantity: 1,
                            }],
                            start_date: stripeSubscription.current_period_end, // Start when previous phase ends
                        }
                    ],
                });
            }
        } else {
            // Try to create new schedule, but handle the case where one already exists
            console.log('📅 Attempting to create new subscription schedule...');
            try {
                const subscriptionSchedule = await stripe.subscriptionSchedules.create({
                    from_subscription: subscription.stripe_subscription_id,
                });

                console.log('✅ Initial schedule created:', subscriptionSchedule.id);

                // Add the downgrade phase to the newly created schedule
                // We can't modify the current phase, but we can add future phases
                updatedSchedule = await stripe.subscriptionSchedules.update(subscriptionSchedule.id, {
                    phases: [
                        // Keep the existing phase (clean it of empty properties)
                        ...(subscriptionSchedule.phases.map(phase => ({
                            items: phase.items as any,
                            start_date: phase.start_date,
                            end_date: phase.end_date,
                            ...(phase.collection_method && { collection_method: phase.collection_method }),
                            ...(phase.invoice_settings && { invoice_settings: phase.invoice_settings as any }),
                        })) as any),
                        {
                            // Add new phase - downgraded plan starts after current period
                            items: [{
                                price: newPriceId,
                                quantity: 1,
                            }],
                            start_date: stripeSubscription.current_period_end,
                        }
                    ],
                });
            } catch (createError) {
                // If creation fails due to existing schedule, extract the schedule ID and update it
                const errorMessage = createError instanceof Error ? createError.message : String(createError);
                const scheduleMatch = errorMessage.match(/sub_sched_[a-zA-Z0-9]+/);

                if (scheduleMatch) {
                    const extractedScheduleId = scheduleMatch[0];
                    console.log('🔄 Creation failed, updating existing schedule from error:', extractedScheduleId);

                                        // Get the existing schedule to handle it properly
                    const existingSchedule = await stripe.subscriptionSchedules.retrieve(extractedScheduleId);
                    const currentTime = Math.floor(Date.now() / 1000);
                    const isCurrentPhaseStarted = existingSchedule.current_phase &&
                        existingSchedule.current_phase.start_date <= currentTime;

                    if (isCurrentPhaseStarted) {
                                                                        // Release existing schedule and create new one
                        await stripe.subscriptionSchedules.release(extractedScheduleId);

                        const newSchedule = await stripe.subscriptionSchedules.create({
                            from_subscription: subscription.stripe_subscription_id,
                        });

                        updatedSchedule = await stripe.subscriptionSchedules.update(newSchedule.id, {
                            phases: [
                                ...(newSchedule.phases.map(phase => ({
                                    items: phase.items as any,
                                    start_date: phase.start_date,
                                    end_date: phase.end_date,
                                    ...(phase.collection_method && { collection_method: phase.collection_method }),
                                    ...(phase.invoice_settings && { invoice_settings: phase.invoice_settings as any }),
                                })) as any),
                                {
                                    items: [{
                                        price: newPriceId,
                                        quantity: 1,
                                    }],
                                    start_date: stripeSubscription.current_period_end,
                                }
                            ],
                        });
                    } else {
                        // Replace all phases
                        updatedSchedule = await stripe.subscriptionSchedules.update(extractedScheduleId, {
                            phases: [
                                {
                                    // Current phase - keep existing plan until period end
                                    items: stripeSubscription.items.data.map(item => ({
                                        price: item.price.id,
                                        quantity: item.quantity || 1,
                                    })),
                                    start_date: Math.floor(Date.now() / 1000), // Start immediately
                                    end_date: stripeSubscription.current_period_end, // End at current period end
                                },
                                {
                                    // New phase - downgraded plan starts after current period
                                    items: [{
                                        price: newPriceId,
                                        quantity: 1,
                                    }],
                                    start_date: stripeSubscription.current_period_end, // Start when previous phase ends
                                }
                            ],
                        });
                    }
                } else {
                    // Re-throw if we can't extract the schedule ID
                    throw createError;
                }
            }
        }

        console.log('✅ Downgrade scheduled in Stripe using subscription schedule:', {
            schedule_id: updatedSchedule.id,
            subscription_id: updatedSchedule.subscription,
            new_price_id: newPriceId,
            effective_date: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            current_phase_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            phases_count: updatedSchedule.phases.length
        });

                // Update database to reflect the scheduled change
        const planName = getPlanNameFromPriceId(newPriceId);

        const subscriptionData = {
            // Keep current plan active until period end, but mark the scheduled change
            scheduled_plan_change: planName,
            scheduled_change_date: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            stripe_schedule_id: updatedSchedule.id, // Track the schedule ID
            updated_at: new Date().toISOString(),
        };

        console.log('💾 Updating database with scheduled downgrade info...');
        const { data: updateResult, error: updateError } = await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('account_id', accountId)
            .select();

        if (updateError) {
            console.error('❌ Database update error:', updateError);
        } else {
            console.log('✅ Database updated with scheduled downgrade');
        }

        return NextResponse.json({
            success: true,
            message: 'Downgrade scheduled successfully',
            scheduledChange: {
                newPlan: planName,
                effectiveDate: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                currentPlanActiveUntil: new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString(),
                scheduleId: updatedSchedule.id
            }
        });

    } catch (error) {
        console.error('❌ Downgrade scheduling error:', error);
        return NextResponse.json({
            error: 'Failed to schedule downgrade',
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
