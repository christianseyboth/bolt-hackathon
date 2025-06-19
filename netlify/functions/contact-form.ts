import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // Parse form data
        const body = event.body;
        if (!body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No form data provided' }),
            };
        }

        // Parse URL-encoded form data
        const params = new URLSearchParams(body);
        const formData = Object.fromEntries(params.entries());

        // Validate required fields
        const requiredFields = ['name', 'email', 'message', 'subject'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: `Missing required fields: ${missingFields.join(', ')}`
                }),
            };
        }

        // Check honeypot field (should be empty)
        if (formData['bot-field']) {
            console.log('Spam detected via honeypot field');
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Form submitted successfully' }),
            };
        }

        // Log submission (in production, you'd save to database or send email)
        console.log('Contact form submission:', {
            name: formData.name,
            email: formData.email,
            company: formData.company || 'Not provided',
            subject: formData.subject,
            message: formData.message,
            timestamp: new Date().toISOString(),
            ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown',
        });

        // Here you could integrate with:
        // - Email service (SendGrid, Mailgun, etc.)
        // - Database (Supabase, PostgreSQL, etc.)
        // - Slack webhook
        // - etc.

        // For now, just return success
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({
                message: 'Form submitted successfully',
                timestamp: new Date().toISOString()
            }),
        };

    } catch (error) {
        console.error('Contact form error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: 'Failed to process form submission'
            }),
        };
    }
};
