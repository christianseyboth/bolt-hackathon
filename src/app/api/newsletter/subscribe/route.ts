import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return Response.json({ error: 'Email is required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json({ error: 'Invalid email address' }, { status: 400 });
        }

        // Replace with your Beehiiv publication ID and API key
        const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
        const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

        if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
            console.error('Beehiiv API credentials not configured');
            return Response.json({ error: 'Newsletter service not configured' }, { status: 500 });
        }

        // Subscribe to Beehiiv
        const response = await fetch(
            `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    reactivate_existing: true,
                    send_welcome_email: true,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Beehiiv API error:', data);

            // Handle specific Beehiiv errors
            if (data.detail?.includes('already subscribed')) {
                return Response.json({ error: 'Email is already subscribed' }, { status: 400 });
            }

            return Response.json({ error: 'Failed to subscribe' }, { status: 400 });
        }

        return Response.json({
            success: true,
            message: 'Successfully subscribed to newsletter!'
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
