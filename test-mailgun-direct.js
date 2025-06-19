// Test script for direct Mailgun email function
// Run with: node test-mailgun-direct.js

const testEmailFunction = async () => {
    const testPayload = {
        recipients: ['tobsey@mailbox.org'], // Your email for testing
        reportType: 'Weekly',
        reportDate: 'December 29, 2024',
        frequency: 'weekly',
        periodStart: 'December 22, 2024',
        periodEnd: 'December 29, 2024',
        emailsScanned: 1247,
        threatsBlocked: 23,
        securityScore: 97,
        downloadUrl: 'https://secpilot.io/reports/download/test-123',
        reportFormat: 'pdf',
    };

    try {
        const response = await fetch(
            'http://localhost:8888/.netlify/functions/send-scheduled-report',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testPayload),
            }
        );

        const result = await response.json();

        console.log('📧 Response Status:', response.status);
        console.log('📧 Response Body:', JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('✅ Email test successful!');
        } else {
            console.log('❌ Email test failed');
        }
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
};

// Check if running locally
if (process.env.NODE_ENV !== 'production') {
    console.log('🧪 Testing Mailgun email function...');
    console.log('Make sure to run `npx netlify dev` first!\n');
    testEmailFunction();
} else {
    console.log('⚠️  This test should only be run locally');
}
